package com.revamp.customer.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class SwaggerRedirectController {

    @GetMapping("/swagger")
    public RedirectView redirectToUi() {
        return new RedirectView("/swagger-ui/index.html");
    }
}
