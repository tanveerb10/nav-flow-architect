
import NavigationManager from '@/components/navigation/NavigationManager';

const emptyData = {
  "_id": "empty-nav-data",
  "menu": [],
  "dropdowns": [],
  "createdAt": new Date().toISOString(),
  "updatedAt": new Date().toISOString(),
  "__v": 0
};

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationManager initialData={emptyData} />
    </div>
  );
};

export default Index;
