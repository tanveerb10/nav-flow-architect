import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavigationData, NavigationLink, MenuItem } from '@/types/navigation';
import MenuItemCard from './MenuItemCard';
import DropdownEditor from './DropdownEditor';
import { Menu, Save, AlertTriangle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface NavigationManagerProps {
  initialData: NavigationData;
}

// Form schema for adding new menu item
const menuItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().min(1, 'URL is required'),
  hasDropdown: z.boolean().default(false),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

const NavigationManager: React.FC<NavigationManagerProps> = ({ initialData }) => {
  const [navigationData, setNavigationData] = useState<NavigationData>(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const { toast } = useToast();

  // Setup form for adding menu item
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      title: '',
      url: '/',
      hasDropdown: false,
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updatePositions = <T extends { position: number; _id: string }>(
    items: T[]
  ): T[] => {
    return items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    console.log('Drag end:', { activeData, overData });

    // Handle menu item reordering
    if (activeData?.type === 'menuItem') {
      setNavigationData(prev => {
        const newMenu = [...prev.menu];
        const activeIndex = newMenu.findIndex(item => item._id === active.id);
        const overIndex = newMenu.findIndex(item => item._id === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
          const [movedItem] = newMenu.splice(activeIndex, 1);
          newMenu.splice(overIndex, 0, movedItem);
          
          return {
            ...prev,
            menu: updatePositions(newMenu),
          };
        }
        return prev;
      });
    }

    // Handle column reordering
    if (activeData?.type === 'column') {
      const dropdownId = activeData.dropdownId;
      
      setNavigationData(prev => {
        const newDropdowns = prev.dropdowns.map(dropdown => {
          if (dropdown._id === dropdownId) {
            const newColumns = [...dropdown.dropdown.columns];
            const activeIndex = newColumns.findIndex(col => col._id === activeData.column._id);
            const overIndex = newColumns.findIndex(col => col._id === overData?.column?._id);

            if (activeIndex !== -1 && overIndex !== -1) {
              const [movedColumn] = newColumns.splice(activeIndex, 1);
              newColumns.splice(overIndex, 0, movedColumn);
              
              return {
                ...dropdown,
                dropdown: {
                  ...dropdown.dropdown,
                  columns: updatePositions(newColumns),
                },
              };
            }
          }
          return dropdown;
        });

        return {
          ...prev,
          dropdowns: newDropdowns,
        };
      });
    }

    // Handle link reordering within columns
    if (activeData?.type === 'link') {
      const sourceColumnId = activeData.columnId;
      const targetColumnId = overData?.columnId || sourceColumnId;

      setNavigationData(prev => {
        const newDropdowns = prev.dropdowns.map(dropdown => {
          const newColumns = dropdown.dropdown.columns.map(column => {
            if (column._id === sourceColumnId) {
              let newLinks = [...column.links];
              const activeIndex = newLinks.findIndex(link => link._id === activeData.link._id);
              
              if (sourceColumnId === targetColumnId) {
                // Reordering within same column
                const overIndex = newLinks.findIndex(link => link._id === overData?.link?._id);
                if (activeIndex !== -1 && overIndex !== -1) {
                  const [movedLink] = newLinks.splice(activeIndex, 1);
                  newLinks.splice(overIndex, 0, movedLink);
                }
              } else {
                // Moving to different column (remove from source)
                newLinks.splice(activeIndex, 1);
              }
              
              return {
                ...column,
                links: updatePositions(newLinks),
              };
            }
            
            if (column._id === targetColumnId && sourceColumnId !== targetColumnId) {
              // Add to target column
              const newLinks = [...column.links, activeData.link];
              const overIndex = overData?.link ? 
                newLinks.findIndex(link => link._id === overData.link._id) : 
                newLinks.length - 1;
              
              if (overIndex !== -1) {
                const [movedLink] = newLinks.splice(newLinks.length - 1, 1);
                newLinks.splice(overIndex, 0, movedLink);
              }
              
              return {
                ...column,
                links: updatePositions(newLinks),
              };
            }
            
            return column;
          });

          return {
            ...dropdown,
            dropdown: {
              ...dropdown.dropdown,
              columns: newColumns,
            },
          };
        });

        return {
          ...prev,
          dropdowns: newDropdowns,
        };
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Prevent dropping columns if it would exceed 4 columns
    if (activeData?.type === 'column') {
      const targetDropdownId = overData?.dropdownId || activeData.dropdownId;
      const sourceDropdownId = activeData.dropdownId;

      if (targetDropdownId !== sourceDropdownId) {
        const targetDropdown = navigationData.dropdowns.find(d => d._id === targetDropdownId);
        if (targetDropdown && targetDropdown.dropdown.columns.length >= 4) {
          toast({
            variant: "destructive",
            title: "Maximum columns exceeded",
            description: "❌ Maximum of 4 columns allowed per dropdown.",
          });
          return;
        }
      }
    }
  };

  const handleUpdateLink = (linkId: string, updatedData: Partial<NavigationLink>) => {
    setNavigationData(prev => {
      const newDropdowns = prev.dropdowns.map(dropdown => {
        const newColumns = dropdown.dropdown.columns.map(column => {
          const updatedLinks = column.links.map(link => {
            if (link._id === linkId) {
              return { ...link, ...updatedData };
            }
            return link;
          });
          
          return { ...column, links: updatedLinks };
        });
        
        return {
          ...dropdown,
          dropdown: {
            ...dropdown.dropdown,
            columns: newColumns,
          },
        };
      });
      
      return {
        ...prev,
        dropdowns: newDropdowns,
      };
    });
    
    toast({
      title: "Link updated",
      description: "Link URL has been updated successfully.",
    });
  };

  const handleAddMenuItem = (values: MenuItemFormValues) => {
    const newMenuItem: MenuItem = {
      title: values.title,
      url: values.url,
      hasDropdown: values.hasDropdown,
      position: navigationData.menu.length + 1,
      _id: `new-menu-${Date.now()}`, // Generate a temporary ID
    };

    setNavigationData(prev => ({
      ...prev,
      menu: [...prev.menu, newMenuItem],
    }));

    form.reset();
    setIsAddingMenu(false);
    
    toast({
      title: "Menu item added",
      description: `"${newMenuItem.title}" has been added to the menu.`,
    });
  };

  const handleSave = () => {
    console.log('Saving navigation data:', navigationData);
    toast({
      title: "Navigation saved",
      description: "Your navigation structure has been updated successfully.",
    });
  };

  const menuItemIds = navigationData.menu.map(item => item._id);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Menu size={24} className="text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Navigation Manager</h1>
            <p className="text-gray-600">Manage your website's navigation structure</p>
          </div>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save size={16} />
          Save Changes
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Main Menu Items</h2>
              <p className="text-sm text-gray-600">Drag to reorder menu items</p>
            </div>
            
            <Button 
              onClick={() => setIsAddingMenu(!isAddingMenu)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Menu Item
            </Button>
          </CardHeader>
          
          <CardContent>
            {isAddingMenu && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddMenuItem)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Menu Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Products" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL</FormLabel>
                              <FormControl>
                                <Input placeholder="/products" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          id="hasDropdown"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={form.watch("hasDropdown")}
                          onChange={e => form.setValue("hasDropdown", e.target.checked)}
                        />
                        <label htmlFor="hasDropdown" className="text-sm text-gray-700">
                          Has dropdown menu
                        </label>
                      </div>
                      
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setIsAddingMenu(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add Menu Item</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-4">
              <SortableContext items={menuItemIds} strategy={verticalListSortingStrategy}>
                {navigationData.menu
                  .sort((a, b) => a.position - b.position)
                  .map((item) => {
                    // Find the dropdown for this menu item if it exists
                    const itemDropdown = item.hasDropdown 
                      ? navigationData.dropdowns.find(d => d.menuTitle === item.title)
                      : null;
                    
                    return (
                      <div key={item._id}>
                        <MenuItemCard item={item} />
                        {item.hasDropdown && itemDropdown && (
                          <DropdownEditor
                            dropdown={itemDropdown}
                            onUpdateLink={handleUpdateLink}
                          />
                        )}
                      </div>
                    );
                  })}
              </SortableContext>
            </div>
          </CardContent>
        </Card>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-90 rotate-3 transform scale-105">
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-gray-600">
                    Dragging item...
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900 mb-1">Constraints</h3>
              <p className="text-sm text-orange-800">
                • Maximum of 4 columns allowed per dropdown menu<br />
                • Positions are automatically updated after reordering<br />
                • All changes are preserved in the original data structure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationManager;
