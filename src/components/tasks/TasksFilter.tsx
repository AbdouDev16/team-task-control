
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TasksFilterProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TasksFilter: React.FC<TasksFilterProps> = ({ activeTab, setActiveTab }) => {
  return (
    <Tabs 
      defaultValue="all" 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="mb-6"
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">Toutes</TabsTrigger>
        <TabsTrigger value="not-started">Non commencées</TabsTrigger>
        <TabsTrigger value="in-progress">En cours</TabsTrigger>
        <TabsTrigger value="completed">Terminées</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TasksFilter;
