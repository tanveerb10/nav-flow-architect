
// Navigation data structure examples for reference

export const navigationExamples = {
  navigationLink: {
    label: "Example Link",
    url: "/example",
    position: 1,
    _id: "link-123"
  },

  dropdownColumn: {
    type: "links", // or "image"
    title: "Column Title",
    links: [],
    image: {
      url: "https://example.com/image.jpg",
      altText: "Image description"
    },
    position: 1,
    _id: "col-123"
  },

  dropdownData: {
    menuTitle: "Menu Title",
    columns: [],
    _id: "dropdown-123"
  },

  menuDropdown: {
    menuTitle: "Menu Title", 
    dropdown: {
      menuTitle: "Menu Title",
      columns: [],
      _id: "dropdown-123"
    },
    _id: "menu-dropdown-123"
  },

  menuItem: {
    title: "Menu Item",
    url: "/menu-item",
    hasDropdown: false,
    position: 1,
    _id: "menu-123"
  },

  navigationData: {
    _id: "nav-123",
    menu: [],
    dropdowns: [],
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
    __v: 0
  }
};
