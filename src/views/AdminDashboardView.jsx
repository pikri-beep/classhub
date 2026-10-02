import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import WhatsAppShareModal from '../components/WhatsAppShareModal';

import OverviewTab from './admin/tabs/OverviewTab';
import TasksTab from './admin/tabs/TasksTab';
import ExamsTab from './admin/tabs/ExamsTab';
import SchedulesTab from './admin/tabs/SchedulesTab';
import CashTab from './admin/tabs/CashTab';
import AnnouncementsTab from './admin/tabs/AnnouncementsTab';
import MembersTab from './admin/tabs/MembersTab';
import SettingsTab from './admin/tabs/SettingsTab';

export default function AdminDashboardView({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  isWhatsAppOpen: propIsWhatsAppOpen,
  setIsWhatsAppOpen: propSetIsWhatsAppOpen
}) {
  const { currentUser } = useAuth();
  const { data } = useStore();

  const [internalActiveTab, setInternalActiveTab] = useState('overview');
  const activeTab = propActiveTab !== undefined ? propActiveTab : internalActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setInternalActiveTab;

  const [internalIsWhatsAppOpen, setInternalIsWhatsAppOpen] = useState(false);
  const isWhatsAppModalOpen = propIsWhatsAppOpen !== undefined ? propIsWhatsAppOpen : internalIsWhatsAppOpen;
  const setIsWhatsAppModalOpen = propSetIsWhatsAppOpen !== undefined ? propSetIsWhatsAppOpen : setInternalIsWhatsAppOpen;

  // Cross-tab coordination for Tasks (e.g. Overview shortcut to create or edit task)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleOpenAddTaskFromOverview = () => {
    setActiveTab('tasks');
    setIsAddTaskOpen(true);
  };

  const handleEditTaskFromOverview = (task) => {
    setTaskToEdit(task);
    setActiveTab('tasks');
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Tab Routing */}
      {activeTab === 'overview' && (
        <OverviewTab
          setActiveTab={setActiveTab}
          onOpenAddTask={handleOpenAddTaskFromOverview}
          onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)}
          onEditTask={handleEditTaskFromOverview}
        />
      )}

      {activeTab === 'tasks' && (
        <TasksTab
          isAddTaskOpen={isAddTaskOpen}
          setIsAddTaskOpen={setIsAddTaskOpen}
          taskToEdit={taskToEdit}
          setTaskToEdit={setTaskToEdit}
        />
      )}

      {activeTab === 'exams' && <ExamsTab />}

      {activeTab === 'schedules' && <SchedulesTab />}

      {activeTab === 'cash' && <CashTab />}

      {activeTab === 'announcements' && <AnnouncementsTab />}

      {activeTab === 'members' && <MembersTab />}

      {activeTab === 'settings' && (
        <SettingsTab onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)} />
      )}

      {/* Global WhatsApp Smart Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        tasks={data?.tasks || []}
        classInfo={data?.classInfo}
        currentUser={currentUser}
      />
    </div>
  );
}
