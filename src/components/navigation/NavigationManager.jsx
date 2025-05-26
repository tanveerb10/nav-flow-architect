import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  Paper
} from '@mui/material';
import {
  Menu,
  Save,
  Warning,
  Add
} from '@mui/icons-material';
import MenuItemCard from './MenuItemCard';
import DropdownEditor from './DropdownEditor';
import { useToast } from '@/hooks/use-toast';
import * as yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const menuItemSchema = yup.object({
  title: yup.string().required('Title is required'),
  url: yup.string().required('URL is required'),
  hasDropdown: yup.boolean().default(false),
});

const NavigationManager = ({ initialData }) => {
  const [navigationData, setNavigationData] = useState(initialData);
  const [activeId, setActiveId] = useState(null);
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [expandedMenuItems, setExpandedMenuItems] = useState(new Set());
  const { toast } = useToast();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(menuItemSchema),
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

  const updatePositions = (items) => {
    return items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    console.log('Drag end:', { activeData, overData });

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
                const overIndex = newLinks.findIndex(link => link._id === overData?.link?._id);
                if (activeIndex !== -1 && overIndex !== -1) {
                  const [movedLink] = newLinks.splice(activeIndex, 1);
                  newLinks.splice(overIndex, 0, movedLink);
                }
              } else {
                newLinks.splice(activeIndex, 1);
              }
              
              return {
                ...column,
                links: updatePositions(newLinks),
              };
            }
            
            if (column._id === targetColumnId && sourceColumnId !== targetColumnId) {
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

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

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

  const handleDeleteMenuItem = (menuItemId) => {
    const menuItem = navigationData.menu.find(item => item._id === menuItemId);
      
    const newMenu = navigationData.menu.filter(item => item._id !== menuItemId);
      
    const newDropdowns = menuItem?.hasDropdown 
      ? navigationData.dropdowns.filter(dropdown => dropdown.menuTitle !== menuItem.title)
      : navigationData.dropdowns;
      
    setNavigationData(prev => ({
      ...prev,
      menu: updatePositions(newMenu),
      dropdowns: newDropdowns,
    }));

    setExpandedMenuItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(menuItemId);
      return newSet;
    });
    
    toast({
      title: "Menu item deleted",
      description: "Menu item and associated dropdown have been removed.",
    });
  };

  const handleToggleExpanded = (menuItemId) => {
    setExpandedMenuItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuItemId)) {
        newSet.delete(menuItemId);
      } else {
        newSet.add(menuItemId);
      }
      return newSet;
    });
  };

  const handleUpdateLink = (linkId, updatedData) => {
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
      description: `Link ${updatedData.label ? 'title' : 'URL'} has been updated successfully.`,
    });
  };

  const handleAddColumn = (dropdownId, columnType = 'links') => {
    setNavigationData(prev => {
      let targetDropdown = prev.dropdowns.find(d => d._id === dropdownId);
      
      if (!targetDropdown) {
        const menuItem = prev.menu.find(item => item.hasDropdown && `dropdown-${item.title}` === dropdownId);
        if (menuItem) {
          const newDropdown = {
            _id: `new-dropdown-${Date.now()}`,
            menuTitle: menuItem.title,
            dropdown: {
              columns: [],
            },
          };
          
          const newDropdowns = [...prev.dropdowns, newDropdown];
          targetDropdown = newDropdown;
          
          const updatedData = {
            ...prev,
            dropdowns: newDropdowns,
          };
          
          const newColumn = {
            _id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: columnType,
            title: columnType === 'links' ? 'Column 1' : 'Image Column',
            links: [],
            position: 1,
          };
          
          if (columnType === 'image') {
            newColumn.image = {
              url: '',
              altText: '',
              linkUrl: ''
            };
          }
          
          const finalDropdowns = updatedData.dropdowns.map(dropdown => {
            if (dropdown._id === newDropdown._id) {
              return {
                ...dropdown,
                dropdown: {
                  ...dropdown.dropdown,
                  columns: [newColumn],
                },
              };
            }
            return dropdown;
          });
          
          return {
            ...updatedData,
            dropdowns: finalDropdowns,
          };
        }
      } else {
        const newDropdowns = prev.dropdowns.map(dropdown => {
          if (dropdown._id === dropdownId) {
            const columns = dropdown.dropdown.columns || [];
            
            const newColumn = {
              _id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: columnType,
              title: columnType === 'links' ? `Column ${columns.length + 1}` : 'Image Column',
              links: [],
              position: columns.length + 1,
            };
            
            if (columnType === 'image') {
              newColumn.image = {
                url: '',
                altText: '',
                linkUrl: ''
              };
            }
            
            return {
              ...dropdown,
              dropdown: {
                ...dropdown.dropdown,
                columns: [...columns, newColumn],
              },
            };
          }
          return dropdown;
        });
        
        return {
          ...prev,
          dropdowns: newDropdowns,
        };
      }
      
      return prev;
    });
    
    toast({
      title: "Column added",
      description: `New ${columnType} column has been added to the dropdown.`,
    });
  };

  const handleRemoveColumn = (dropdownId, columnId) => {
    setNavigationData(prev => {
      const newDropdowns = prev.dropdowns.map(dropdown => {
        if (dropdown._id === dropdownId) {
          const filteredColumns = dropdown.dropdown.columns.filter(column => column._id !== columnId);
          
          return {
            ...dropdown,
            dropdown: {
              ...dropdown.dropdown,
              columns: updatePositions(filteredColumns),
            },
          };
        }
        return dropdown;
      });
      
      return {
        ...prev,
        dropdowns: newDropdowns,
      };
    });
    
    toast({
      title: "Column removed",
      description: "Column has been removed from the dropdown.",
    });
  };

  const handleDeleteLink = (dropdownId, columnId, linkId) => {
    setNavigationData(prev => {
      const newDropdowns = prev.dropdowns.map(dropdown => {
        if (dropdown._id === dropdownId) {
          const newColumns = dropdown.dropdown.columns.map(column => {
            if (column._id === columnId) {
              const filteredLinks = column.links.filter(link => link._id !== linkId);
              return {
                ...column,
                links: updatePositions(filteredLinks),
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
        }
        return dropdown;
      });
      
      return {
        ...prev,
        dropdowns: newDropdowns,
      };
    });
    
    toast({
      title: "Link deleted",
      description: "Link has been removed from the dropdown.",
    });
  };

  const handleAddLink = (dropdownId, columnId) => {
    setNavigationData(prev => {
      const newDropdowns = prev.dropdowns.map(dropdown => {
        if (dropdown._id === dropdownId) {
          const newColumns = dropdown.dropdown.columns.map(column => {
            if (column._id === columnId) {
              const newLink = {
                _id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                label: 'New Link',
                url: '/',
                position: column.links.length + 1,
              };
              
              return {
                ...column,
                links: [...column.links, newLink],
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
        }
        return dropdown;
      });
      
      return {
        ...prev,
        dropdowns: newDropdowns,
      };
    });
    
    toast({
      title: "Link added",
      description: "New link has been added to the column.",
    });
  };

  const handleUpdateColumn = (dropdownId, columnId, updatedData) => {
    setNavigationData(prev => {
      const newDropdowns = prev.dropdowns.map(dropdown => {
        if (dropdown._id === dropdownId) {
          const newColumns = dropdown.dropdown.columns.map(column => {
            if (column._id === columnId) {
              return {
                ...column,
                ...updatedData,
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
        }
        return dropdown;
      });
      
      return {
        ...prev,
        dropdowns: newDropdowns,
      };
    });
    
    toast({
      title: "Column updated",
      description: "Column title has been updated.",
    });
  };

  const handleAddMenuItem = (values) => {
    const newMenuItem = {
      title: values.title,
      url: values.url,
      hasDropdown: values.hasDropdown,
      position: navigationData.menu.length + 1,
      _id: `new-menu-${Date.now()}`,
    };

    setNavigationData(prev => ({
      ...prev,
      menu: [...prev.menu, newMenuItem],
    }));

    reset();
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
    <Box sx={{ maxWidth: '1280px', mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <Menu sx={{ fontSize: 24, color: '#2563eb' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Navigation Manager
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your website's navigation structure
            </Typography>
          </Box>
        </Box>
        <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
          Save Changes
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <Card>
          <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h6" fontWeight="semibold" color="text.primary">
                  Main Menu Items
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {navigationData.menu.length > 0 
                    ? "Drag to reorder menu items" 
                    : "Start by adding your first menu item"}
                </Typography>
              </Box>
              
              <Button 
                onClick={() => setIsAddingMenu(!isAddingMenu)} 
                variant="outlined" 
                startIcon={<Add />}
              >
                Add Menu Item
              </Button>
            </Box>
          </Box>
          
          <CardContent>
            {navigationData.menu.length === 0 && !isAddingMenu && (
              <Box textAlign="center" py={6}>
                <Menu sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                <Typography variant="h6" fontWeight="medium" color="text.primary" mb={1}>
                  No menu items yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Start building your navigation by adding your first menu item.
                </Typography>
                <Button 
                  onClick={() => setIsAddingMenu(true)} 
                  variant="contained"
                  startIcon={<Add />}
                >
                  Add Menu Item
                </Button>
              </Box>
            )}

            {isAddingMenu && (
              <Card sx={{ mb: 3, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <CardContent>
                  <form onSubmit={handleSubmit(handleAddMenuItem)}>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Menu Title"
                              placeholder="e.g. Products"
                              size="small"
                              error={!!errors.title}
                              helperText={errors.title?.message}
                            />
                          )}
                        />
                        
                        <Controller
                          name="url"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="URL"
                              placeholder="/products"
                              size="small"
                              error={!!errors.url}
                              helperText={errors.url?.message}
                            />
                          )}
                        />
                      </Box>
                      
                      <Controller
                        name="hasDropdown"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label="Has dropdown menu"
                          />
                        )}
                      />
                      
                      <Box display="flex" justifyContent="flex-end" gap={1} pt={1}>
                        <Button 
                          type="button" 
                          variant="text" 
                          onClick={() => setIsAddingMenu(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                          Add Menu Item
                        </Button>
                      </Box>
                    </Box>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {navigationData.menu.length > 0 && (
              <Box display="flex" flexDirection="column" gap={2}>
                <SortableContext items={menuItemIds} strategy={verticalListSortingStrategy}>
                  {navigationData.menu
                    .sort((a, b) => a.position - b.position)
                    .map((item) => {
                      const itemDropdown = item.hasDropdown 
                        ? navigationData.dropdowns.find(d => d.menuTitle === item.title)
                        : null;
                      
                      const isExpanded = expandedMenuItems.has(item._id);
                      
                      return (
                        <div key={item._id}>
                          <MenuItemCard 
                            item={item} 
                            dropdown={itemDropdown}
                            isExpanded={isExpanded}
                            onAddColumn={handleAddColumn}
                            onDeleteMenuItem={handleDeleteMenuItem}
                            onToggleExpanded={handleToggleExpanded}
                          />
                          {item.hasDropdown && itemDropdown && isExpanded && (
                            <DropdownEditor
                              dropdown={itemDropdown}
                              onUpdateLink={handleUpdateLink}
                              onDeleteLink={handleDeleteLink}
                              onAddLink={handleAddLink}
                              onUpdateColumn={handleUpdateColumn}
                              onRemoveColumn={handleRemoveColumn}
                            />
                          )}
                        </div>
                      );
                    })}
                </SortableContext>
              </Box>
            )}
          </CardContent>
        </Card>

        <DragOverlay>
          {activeId ? (
            <Box sx={{ opacity: 0.9, transform: 'rotate(3deg) scale(1.05)' }}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" fontWeight="medium" color="text.secondary">
                    Dragging item...
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Alert 
        severity="warning" 
        sx={{ bgcolor: '#fef3c7', border: '1px solid #fbbf24', color: '#92400e' }}
        icon={<Warning sx={{ color: '#d97706' }} />}
      >
        <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
          Constraints
        </Typography>
        <Typography variant="body2">
          • Maximum of 4 columns allowed per dropdown menu<br />
          • Positions are automatically updated after reordering<br />
          • All changes are preserved in the original data structure<br />
          • Dropdown columns can be expanded/collapsed for better management
        </Typography>
      </Alert>
    </Box>
  );
};

export default NavigationManager;
