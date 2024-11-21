export type toDirection = "top" | "bottom";

export const scrollTo = (direction: toDirection) => {
  const scrollableContainer = document.querySelector(".InnerPage__container");
  if (scrollableContainer) {
    const scrollToOptions: ScrollToOptions = {
      behavior: "smooth",
    };

    if (direction === "top") {
      scrollToOptions.top = 0;
    } else if (direction === "bottom") {
      scrollToOptions.top = scrollableContainer.scrollHeight;
    }

    scrollableContainer.scrollTo(scrollToOptions);
  }
};
