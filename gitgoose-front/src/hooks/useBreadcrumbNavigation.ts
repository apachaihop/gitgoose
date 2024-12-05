import { useState, useCallback } from 'react';

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast?: boolean;
}

export function useBreadcrumbNavigation(initialItems: BreadcrumbItem[] = []) {
  const [items, setItems] = useState<BreadcrumbItem[]>(initialItems);

  const pushItem = useCallback((item: Omit<BreadcrumbItem, 'isLast'>) => {
    setItems(current => {
      const newItems = current.map(i => ({ ...i, isLast: false }));
      return [...newItems, { ...item, isLast: true }];
    });
  }, []);

  const popItem = useCallback(() => {
    setItems(current => {
      const newItems = current.slice(0, -1);
      if (newItems.length > 0) {
        newItems[newItems.length - 1].isLast = true;
      }
      return newItems;
    });
  }, []);

  const resetItems = useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  }, []);

  return {
    items,
    pushItem,
    popItem,
    resetItems
  };
}