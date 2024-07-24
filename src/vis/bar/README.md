# Bar plot configuration notes

## Focus facet

The focus facet mode is a feature that allows you to highlight a specific bar plot when faceting is enabled. This feature is useful when you want to focus on a specific facet and compare it with the rest of the facets. The focus facet mode is enabled by clicking on the bar plot title or selecting a category in the facet selector dialog. It will only show one bar plot at once. The focus facet mode can be disabled by clicking on the bar plot title again, or by deselecting the category via the selector dialog.

To enable the focus facet selector, it needs to be enabled in the visConfig:

```json
showFocusFacetSelector: true
```

If you utilize a non-standard view header, please be referred to `barComponents/FocusFacetSelector.ts` to have a reference implementation that can be reused.
