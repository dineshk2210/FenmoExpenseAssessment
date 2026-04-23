package com.expensetracker;

import com.expensetracker.dto.AuthResponse;
import com.expensetracker.dto.ExpenseResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ExpenseControllerTest {

    @Autowired
    private TestRestTemplate rest;

    private String token;

    @BeforeEach
    void setUp() {
        // Register a test user
        Map<String, String> regBody = Map.of("name", "Test", "email", "test" + System.nanoTime() + "@test.com", "password", "password123");
        ResponseEntity<AuthResponse> regRes = rest.postForEntity("/auth/register", regBody, AuthResponse.class);
        assertEquals(HttpStatus.CREATED, regRes.getStatusCode());
        token = regRes.getBody().getToken();
    }

    private HttpHeaders authHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setBearerAuth(token);
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    @Test
    void createAndListExpenses() {
        Map<String, Object> body = Map.of("amount", 150.50, "category", "Food", "description", "Lunch", "date", "2026-04-23", "idempotencyKey", "key-" + System.nanoTime());

        // Create
        ResponseEntity<ExpenseResponse> created = rest.exchange("/expenses", HttpMethod.POST, new HttpEntity<>(body, authHeaders()), ExpenseResponse.class);
        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        assertEquals(150.50, created.getBody().getAmount());

        // Idempotency: same key returns same record
        ResponseEntity<ExpenseResponse> dup = rest.exchange("/expenses", HttpMethod.POST, new HttpEntity<>(body, authHeaders()), ExpenseResponse.class);
        assertEquals(HttpStatus.OK, dup.getStatusCode());
        assertEquals(created.getBody().getId(), dup.getBody().getId());

        // List
        ResponseEntity<ExpenseResponse[]> list = rest.exchange("/expenses", HttpMethod.GET, new HttpEntity<>(authHeaders()), ExpenseResponse[].class);
        assertEquals(HttpStatus.OK, list.getStatusCode());
        assertTrue(list.getBody().length >= 1);

        // Filter
        ResponseEntity<ExpenseResponse[]> filtered = rest.exchange("/expenses?category=Food&sort=date_desc", HttpMethod.GET, new HttpEntity<>(authHeaders()), ExpenseResponse[].class);
        assertEquals(HttpStatus.OK, filtered.getStatusCode());
        for (ExpenseResponse e : filtered.getBody()) assertEquals("Food", e.getCategory());
    }

    @Test
    void unauthenticatedRequestsAreRejected() {
        ResponseEntity<String> res = rest.getForEntity("/expenses", String.class);
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
    }

    @Test
    void usersCannotSeeEachOthersExpenses() {
        // User 1 creates an expense
        Map<String, Object> body = Map.of("amount", 100, "category", "Food", "description", "Mine", "date", "2026-04-23");
        rest.exchange("/expenses", HttpMethod.POST, new HttpEntity<>(body, authHeaders()), ExpenseResponse.class);

        // Register user 2
        Map<String, String> reg2 = Map.of("name", "Other", "email", "other" + System.nanoTime() + "@test.com", "password", "password123");
        ResponseEntity<AuthResponse> reg2Res = rest.postForEntity("/auth/register", reg2, AuthResponse.class);
        HttpHeaders h2 = new HttpHeaders();
        h2.setBearerAuth(reg2Res.getBody().getToken());

        // User 2 sees no expenses
        ResponseEntity<ExpenseResponse[]> list = rest.exchange("/expenses", HttpMethod.GET, new HttpEntity<>(h2), ExpenseResponse[].class);
        assertEquals(0, list.getBody().length);
    }
}
