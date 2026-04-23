package com.expensetracker.repository;

import com.expensetracker.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, String> {
    Optional<Expense> findByIdempotencyKey(String idempotencyKey);
    List<Expense> findByUserIdAndCategoryOrderByDateDescCreatedAtDesc(String userId, String category);
    List<Expense> findByUserIdAndCategoryOrderByCreatedAtDesc(String userId, String category);
    List<Expense> findByUserIdOrderByDateDescCreatedAtDesc(String userId);
    List<Expense> findByUserIdOrderByCreatedAtDesc(String userId);
}
