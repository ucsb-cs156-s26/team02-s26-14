package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_helprequest() throws Exception {
    setupUser(true);

    // EXACT MATCH: Singular, no spaces, matching AppNavbar.js
    page.getByText("HelpRequest").click();

    // Create a new HelpRequest
    page.getByText("Create HelpRequest").click();
    assertThat(page.getByText("Create New HelpRequest")).isVisible();
    page.getByTestId("HelpRequestForm-requesterEmail").fill("cgaucho@ucsb.edu");
    page.getByTestId("HelpRequestForm-teamId").fill("s22-5pm-3");
    page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("7");
    page.getByTestId("HelpRequestForm-explanation").fill("Need help with Swagger");

    // Playwright Date Picker Bypass Trick
    page.getByTestId("HelpRequestForm-requestTime").fill("2022-02-02T00:00");

    page.getByTestId("HelpRequestForm-submit").click();

    // Verify it was created in the table
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Need help with Swagger");

    // Edit the HelpRequest
    page.getByTestId("HelpRequestTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit HelpRequest")).isVisible();
    page.getByTestId("HelpRequestForm-explanation").fill("Need help with Playwright tests");
    page.getByTestId("HelpRequestForm-submit").click();

    // Verify the edit saved
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Need help with Playwright tests");

    // Delete the HelpRequest
    page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button").click();

    // Verify it is gone
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_helprequest() throws Exception {
    setupUser(false);

    // EXACT MATCH: Singular, no spaces, matching AppNavbar.js
    page.getByText("HelpRequest").click();

    assertThat(page.getByText("Create HelpRequest")).not().isVisible();
    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation")).not().isVisible();
  }
}
