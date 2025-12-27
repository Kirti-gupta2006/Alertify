import { motion } from 'framer-motion';
import { useIncidentStore } from '@/stores/incidentStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  X, 
  Car, 
  Heart, 
  Flame, 
  Construction, 
  Shield,
  Clock
} from 'lucide-react';
import { IncidentType, Severity, IncidentStatus, incidentTypeLabels, severityLabels, statusLabels } from '@/types/incident';

const incidentTypeOptions: { value: IncidentType; label: string; icon: React.ElementType }[] = [
  { value: 'accident', label: 'Accident', icon: Car },
  { value: 'medical', label: 'Medical', icon: Heart },
  { value: 'fire', label: 'Fire', icon: Flame },
  { value: 'infrastructure', label: 'Infrastructure', icon: Construction },
  { value: 'crime', label: 'Crime', icon: Shield },
];

const severityOptions: { value: Severity; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const timeRangeOptions = [
  { value: '1h', label: 'Last hour' },
  { value: '6h', label: 'Last 6 hours' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: 'all', label: 'All time' },
];

export function IncidentFilters() {
  const { filters, setFilters, clearFilters } = useIncidentStore();

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');
  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search incidents by ID, title, or location..."
          value={filters.searchQuery || ''}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
          className="pl-10 bg-card/50"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* Type Filter */}
        <Select
          value={filters.type || ''}
          onValueChange={(value) => setFilters({ type: value as IncidentType || undefined })}
        >
          <SelectTrigger className="w-[130px] h-9 bg-card/50">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {incidentTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Severity Filter */}
        <Select
          value={filters.severity || ''}
          onValueChange={(value) => setFilters({ severity: value as Severity || undefined })}
        >
          <SelectTrigger className="w-[120px] h-9 bg-card/50">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            {severityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <Badge variant={`severity-${option.value}` as any} className="font-normal">
                  {option.label}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Time Range Filter */}
        <Select
          value={filters.timeRange || 'all'}
          onValueChange={(value) => setFilters({ timeRange: value as any })}
        >
          <SelectTrigger className="w-[140px] h-9 bg-card/50">
            <Clock className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear ({activeFilterCount})
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
