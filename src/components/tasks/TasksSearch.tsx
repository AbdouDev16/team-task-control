
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TasksSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const TasksSearch: React.FC<TasksSearchProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Rechercher une tâche..." 
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={() => {}}
        >
          <Calendar className="mr-2 h-4 w-4" /> Vue calendrier
        </Button>
      </div>
    </div>
  );
};

export default TasksSearch;
