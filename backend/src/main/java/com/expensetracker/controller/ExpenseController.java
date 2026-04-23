package com.expensetracker.controller;

import com.expensetracker.dto.CreateExpenseRequest;
import com.expensetracker.dto.ExpenseResponse;
import com.expensetracker.model.Expense;
import com.expensetracker.repository.ExpenseRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseRepository repo;

    public ExpenseController(ExpenseRepository repo) {
        this.repo = repo;
    }

    private String currentUserId() {
        return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(@Valid @RequestBody CreateExpenseRequest req) {
        String userId = currentUserId();

        if (req.getIdempotencyKey() != null) {
            Optional<Expense> existing = repo.findByIdempotencyKey(req.getIdempotencyKey());
            if (existing.isPresent()) {
                return ResponseEntity.ok(ExpenseResponse.from(existing.get()));
            }
        }

        Expense e = new Expense();
        e.setId(UUID.randomUUID().toString());
        e.setUserId(userId);
        e.setIdempotencyKey(req.getIdempotencyKey());
        e.setAmountCents(Math.round(req.getAmount() * 100));
        e.setCategory(req.getCategory().trim());
        e.setDescription(req.getDescription() != null ? req.getDescription().trim() : "");
        e.setDate(req.getDate());

        try {
            repo.save(e);
        } catch (Exception ex) {
            if (req.getIdempotencyKey() != null) {
                Optional<Expense> existing = repo.findByIdempotencyKey(req.getIdempotencyKey());
                if (existing.isPresent()) {
                    return ResponseEntity.ok(ExpenseResponse.from(existing.get()));
                }
            }
            throw ex;
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(ExpenseResponse.from(e));
    }

    @GetMapping
    public List<ExpenseResponse> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort) {

        String userId = currentUserId();
        List<Expense> expenses;
        boolean sortByDate = "date_desc".equals(sort);

        if (category != null && !category.isBlank()) {
            expenses = sortByDate
                    ? repo.findByUserIdAndCategoryOrderByDateDescCreatedAtDesc(userId, category)
                    : repo.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category);
        } else {
            expenses = sortByDate
                    ? repo.findByUserIdOrderByDateDescCreatedAtDesc(userId)
                    : repo.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return expenses.stream().map(ExpenseResponse::from).toList();
    }
}
