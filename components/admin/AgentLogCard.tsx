import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { AgentLog } from '@/types';

interface AgentLogCardProps {
  log: AgentLog;
  index?: number;
}

export function AgentLogCard({ log, index = 0 }: AgentLogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index * 0.02 }}
      className="glass-card p-3 rounded-xl text-sm"
    >
      <div className="flex items-center gap-2">
        {log.status === 'success' ? (
          <CheckCircle size={14} className="text-success flex-shrink-0" />
        ) : log.status === 'partial' ? (
          <Clock size={14} className="text-warning flex-shrink-0" />
        ) : (
          <XCircle size={14} className="text-danger flex-shrink-0" />
        )}
        <span className="flex-1 text-xs text-muted line-clamp-1">{log.trigger_event || 'Event'}</span>
        <span className="text-[10px] text-muted font-mono">{log.duration_ms ? `${log.duration_ms}ms` : ''}</span>
      </div>
      <p className="text-[10px] text-muted mt-1 font-mono">{new Date(log.created_at).toLocaleString()}</p>
    </motion.div>
  );
}
