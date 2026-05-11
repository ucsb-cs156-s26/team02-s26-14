package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.Article;
import edu.ucsb.cs156.example.repositories.ArticleRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleWebIT extends WebTestCase {

  @Autowired ArticleRepository articleRepository;

  @Test
  public void admin_user_can_create_edit_delete_article() throws Exception {

    LocalDateTime ldt1 = LocalDateTime.parse("2022-01-03T00:00:00");

    Article article =
        Article.builder()
            .title("First Day of Classes")
            .url("https://example.com/first-day-of-classes")
            .explanation("The first day of classes for the quarter.")
            .email("alessandro_ballerini@ucsb.edu")
            .dateAdded(ldt1)
            .build();

    articleRepository.save(article);

    setupUser(true);
    page.getByText("Articles").click();

    assertThat(page.getByTestId("ArticleTable-cell-row-0-col-title"))
        .hasText("First Day of Classes");

    page.getByTestId("ArticleTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("ArticleTable-cell-row-0-col-title")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_article() throws Exception {
    setupUser(false);

    page.getByText("Articles").click();

    assertThat(page.getByText("Create Article")).not().isVisible();
  }

  @Test
  public void admin_user_can_see_article_button() throws Exception {
    setupUser(true);

    page.getByText("Articles").click();

    assertThat(page.getByText("Create Article")).isVisible();
  }
}
