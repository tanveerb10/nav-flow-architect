
import NavigationManager from '@/components/navigation/NavigationManager';
import { NavigationData } from '@/types/navigation';

const sampleData: NavigationData = {
  "_id": "681d9de5e09f3bdbb9eb6d15",
  "menu": [
    {
      "title": "Shop",
      "url": "/shop",
      "hasDropdown": true,
      "position": 1,
      "_id": "681d9de5e09f3bdbb9eb6d16"
    },
    {
      "title": "Blog",
      "url": "/blog",
      "hasDropdown": false,
      "position": 2,
      "_id": "681d9de5e09f3bdbb9eb6d17"
    }
  ],
  "dropdowns": [
    {
      "menuTitle": "Shop",
      "dropdown": {
        "menuTitle": "Shop",
        "columns": [
          {
            "type": "links",
            "title": "Shirts",
            "links": [
              { "label": "Men Shirts", "url": "/shop/men-shirts", "position": 1, "_id": "681d9de5e09f3bdbb9eb6d1b" },
              { "label": "Cotton Shirts", "url": "/shop/cotton-shirts", "position": 2, "_id": "681d9de5e09f3bdbb9eb6d1c" },
              { "label": "Printed Shirts", "url": "/shop/printed-shirts", "position": 3, "_id": "681d9de5e09f3bdbb9eb6d1d" }
            ],
            "position": 1,
            "_id": "681d9de5e09f3bdbb9eb6d1a"
          },
          {
            "type": "links",
            "title": "Jeans",
            "links": [
              { "label": "Denim Jeans", "url": "/shop/denim-jeans", "position": 1, "_id": "681d9de5e09f3bdbb9eb6d1f" },
              { "label": "Baggy Jeans", "url": "/shop/baggy-jeans", "position": 2, "_id": "681d9de5e09f3bdbb9eb6d20" }
            ],
            "position": 2,
            "_id": "681d9de5e09f3bdbb9eb6d1e"
          },
          {
            "type": "links",
            "title": "Accessories",
            "links": [
              { "label": "Hats", "url": "/shop/hats", "position": 1, "_id": "681d9de5e09f3bdbb9eb6d22" },
              { "label": "Belts", "url": "/shop/belts", "position": 2, "_id": "681d9de5e09f3bdbb9eb6d23" }
            ],
            "position": 3,
            "_id": "681d9de5e09f3bdbb9eb6d21"
          },
          {
            "type": "image",
            "image": {
              "url": "/images/mega-banner.jpg",
              "altText": "Shop Collection"
            },
            "position": 4,
            "_id": "681d9de5e09f3bdbb9eb6d24",
            "title": "",
            "links": []
          }
        ],
        "_id": "681d9de5e09f3bdbb9eb6d19"
      },
      "_id": "681d9de5e09f3bdbb9eb6d18"
    }
  ],
  "createdAt": "2025-05-09T06:17:09.506Z",
  "updatedAt": "2025-05-09T06:17:09.506Z",
  "__v": 0
};

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationManager initialData={sampleData} />
    </div>
  );
};

export default Index;
