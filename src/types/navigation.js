
// Navigation data structure examples

// Example menu item
const exampleMenuItem = {
  _id: "menu-1",
  title: "Products",
  url: "/products",
  hasDropdown: true,
  position: 1
};

// Example dropdown structure
const exampleDropdown = {
  _id: "dropdown-1",
  menuTitle: "Products",
  dropdown: {
    columns: [
      {
        _id: "col-1",
        type: "links",
        title: "Category 1",
        position: 1,
        links: [
          {
            _id: "link-1",
            label: "Product A",
            url: "/products/a",
            position: 1
          }
        ]
      },
      {
        _id: "col-2", 
        type: "image",
        title: "Featured",
        position: 2,
        image: {
          url: "/images/featured.jpg",
          altText: "Featured product",
          linkUrl: "/featured"
        },
        links: []
      }
    ]
  }
};

// Example full navigation data
const exampleNavigationData = {
  _id: "nav-1",
  menu: [exampleMenuItem],
  dropdowns: [exampleDropdown],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  __v: 0
};

export {
  exampleMenuItem,
  exampleDropdown,
  exampleNavigationData
};
