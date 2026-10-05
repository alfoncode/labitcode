const ITEMS_PER_PAGE = 6;

let activeGrid: HTMLElement | null = null;
let activeObserver: IntersectionObserver | null = null;
let activeEvents: AbortController | null = null;

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}

export function initBlogListing(): void {
  const grid = document.getElementById("posts-grid");

  if (!grid) {
    activeObserver?.disconnect();
    activeEvents?.abort();
    activeGrid = null;
    activeObserver = null;
    activeEvents = null;
    return;
  }

  if (grid === activeGrid) return;

  activeObserver?.disconnect();
  activeEvents?.abort();

  activeGrid = grid;
  activeEvents = new AbortController();

  const { signal } = activeEvents;
  const cards = Array.from(grid.querySelectorAll<HTMLElement>(".post-card"));
  const searchInput = document.getElementById("blog-search") as HTMLInputElement | null;
  const clearButton = document.getElementById("blog-search-clear");
  const noPosts = document.getElementById("no-posts");
  const sentinel = document.getElementById("scroll-sentinel");
  const loadMoreButton = document.getElementById("load-more-posts");
  const endMessage = document.getElementById("scroll-end");
  const resultsCount = document.getElementById("results-count");
  const tagButtons = document.querySelectorAll<HTMLButtonElement>("#tag-filters .tag-btn");
  const isSpanish = document.documentElement.lang === "es";

  let activeTag = "all";
  let searchQuery = "";
  let visibleCount = ITEMS_PER_PAGE;
  let matchCount = cards.length;

  function cardMatchesTag(card: HTMLElement): boolean {
    if (activeTag === "all") return true;
    const tags: string[] = JSON.parse(card.dataset.tags || "[]");
    return tags.includes(activeTag);
  }

  function cardMatchesSearch(card: HTMLElement): boolean {
    if (!searchQuery) return true;
    return normalizeSearchText(card.dataset.searchText || "").includes(searchQuery);
  }

  function updateVisibility(): void {
    let shownCount = 0;
    matchCount = 0;

    cards.forEach((card) => {
      const matches = cardMatchesTag(card) && cardMatchesSearch(card);

      if (!matches) {
        card.classList.add("hidden");
        return;
      }

      matchCount++;
      const shouldShow = shownCount < visibleCount;
      card.classList.toggle("hidden", !shouldShow);
      if (shouldShow) shownCount++;
    });

    if (resultsCount) {
      const itemLabel = isSpanish
        ? matchCount === 1
          ? "artículo"
          : "artículos"
        : matchCount === 1
          ? "post"
          : "posts";
      resultsCount.textContent = isSpanish
        ? `Mostrando ${shownCount} de ${matchCount} ${itemLabel}`
        : `Showing ${shownCount} of ${matchCount} ${itemLabel}`;
    }

    const hasMore = shownCount < matchCount;
    noPosts?.classList.toggle("hidden", matchCount > 0);
    loadMoreButton?.classList.toggle("hidden", !hasMore);
    endMessage?.classList.toggle("hidden", hasMore || matchCount === 0);
    sentinel?.classList.toggle("hidden", matchCount === 0);
  }

  function loadMore(): void {
    if (visibleCount >= matchCount) return;
    visibleCount = Math.min(visibleCount + ITEMS_PER_PAGE, matchCount);
    updateVisibility();
  }

  const activeClasses = ["border-accent", "bg-accent/10", "text-accent"];
  const inactiveClasses = [
    "border-border",
    "dark:border-navy-light",
    "text-gray-700",
    "dark:text-gray-300",
  ];

  tagButtons.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        activeTag = button.dataset.tag || "all";
        visibleCount = ITEMS_PER_PAGE;

        tagButtons.forEach((tagButton) => {
          tagButton.setAttribute("aria-pressed", String(tagButton === button));
          tagButton.classList.remove(...activeClasses);
          tagButton.classList.add(...inactiveClasses);
        });

        button.classList.add(...activeClasses);
        button.classList.remove(...inactiveClasses);
        updateVisibility();
      },
      { signal }
    );
  });

  function updateSearch(): void {
    if (!searchInput) return;
    searchQuery = normalizeSearchText(searchInput.value.trim());
    visibleCount = ITEMS_PER_PAGE;
    clearButton?.classList.toggle("hidden", !searchInput.value.trim());
    updateVisibility();
  }

  searchInput?.addEventListener("input", updateSearch, { signal });
  searchInput?.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        searchInput.value = "";
        updateSearch();
        searchInput.blur();
      }
    },
    { signal }
  );

  clearButton?.addEventListener(
    "click",
    () => {
      if (!searchInput) return;
      searchInput.value = "";
      updateSearch();
      searchInput.focus();
    },
    { signal }
  );

  loadMoreButton?.addEventListener("click", loadMore, { signal });

  if (sentinel && "IntersectionObserver" in window) {
    activeObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    activeObserver.observe(sentinel);
  }

  updateVisibility();
}

document.addEventListener("astro:page-load", initBlogListing);
