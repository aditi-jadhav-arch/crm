import { useContacts } from "./useContacts";
import { useDeals } from "./useDeals";
import { useActivities } from "./useActivities";

export function useDashboardStats() {
  const { contacts, loading: contactsLoading } = useContacts();
  const { deals, loading: dealsLoading } = useDeals();
  const { activities, loading: activitiesLoading } = useActivities();

  const loading = contactsLoading || dealsLoading || activitiesLoading;

  if (loading) {
    return {
      stats: {
        totalContacts: 0,
        totalContactsTrend: 0,
        openDeals: 0,
        openDealsTrend: 0,
        totalRevenue: 0,
        totalRevenueTrend: 0,
        tasksDueToday: 0,
        tasksDueTodayTrend: 0,
      },
      loading: true,
    };
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const getSeconds = (date: any) => {
    if (!date) return 0;
    if (date.seconds !== undefined) return date.seconds;
    if (date.toDate && typeof date.toDate === 'function') return Math.floor(date.toDate().getTime() / 1000);
    if (date instanceof Date) return Math.floor(date.getTime() / 1000);
    return Math.floor(new Date(date).getTime() / 1000);
  };

  const t30 = Math.floor(thirtyDaysAgo.getTime() / 1000);
  const t60 = Math.floor(sixtyDaysAgo.getTime() / 1000);

  // 1. Total Contacts
  const totalContacts = contacts.length;
  const contactsLast30Days = contacts.filter(c => getSeconds(c.createdAt) >= t30).length;
  const contacts30to60Days = contacts.filter(c => getSeconds(c.createdAt) >= t60 && getSeconds(c.createdAt) < t30).length;
  const contactsTrend = contacts30to60Days === 0 
    ? contactsLast30Days * 100 
    : ((contactsLast30Days - contacts30to60Days) / contacts30to60Days) * 100;

  // 2. Open Deals
  const openDealsList = deals.filter(d => !["closed_won", "closed_lost"].includes(d.stage));
  const openDeals = openDealsList.length;
  const openDealsLast30Days = openDealsList.filter(d => getSeconds(d.createdAt) >= t30).length;
  const openDeals30to60Days = openDealsList.filter(d => getSeconds(d.createdAt) >= t60 && getSeconds(d.createdAt) < t30).length;
  const openDealsTrend = openDeals30to60Days === 0 
    ? openDealsLast30Days * 100 
    : ((openDealsLast30Days - openDeals30to60Days) / openDeals30to60Days) * 100;

  // 3. Total Revenue (closed won)
  const wonDeals = deals.filter(d => d.stage === "closed_won");
  const totalRevenue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  
  const wonDealsLast30Days = wonDeals.filter(d => getSeconds(d.actualCloseDate || d.updatedAt) >= t30);
  const wonDeals30to60Days = wonDeals.filter(d => getSeconds(d.actualCloseDate || d.updatedAt) >= t60 && getSeconds(d.actualCloseDate || d.updatedAt) < t30);
  
  const revLast30Days = wonDealsLast30Days.reduce((sum, d) => sum + (d.value || 0), 0);
  const rev30to60Days = wonDeals30to60Days.reduce((sum, d) => sum + (d.value || 0), 0);
  const revenueTrend = rev30to60Days === 0 
    ? revLast30Days * 100 
    : ((revLast30Days - rev30to60Days) / rev30to60Days) * 100;

  // 4. Tasks Due Today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
  
  const tasksDueTodayList = activities.filter(a => {
    if (a.type !== "task" || a.isCompleted) return false;
    if (!a.dueDate) return false;
    const dueTime = getSeconds(a.dueDate) * 1000;
    return dueTime >= startOfToday && dueTime < endOfToday;
  });
  const tasksDueToday = tasksDueTodayList.length;

  const tasksCompletedLast30Days = activities.filter(a => a.type === "task" && a.isCompleted && getSeconds(a.completedAt) >= t30).length;
  const tasksCompleted30to60Days = activities.filter(a => a.type === "task" && a.isCompleted && getSeconds(a.completedAt) >= t60 && getSeconds(a.completedAt) < t30).length;
  const tasksDueTodayTrend = tasksCompleted30to60Days === 0 
    ? tasksCompletedLast30Days * 100 
    : ((tasksCompletedLast30Days - tasksCompleted30to60Days) / tasksCompleted30to60Days) * 100;

  return {
    stats: {
      totalContacts,
      totalContactsTrend: Math.round(contactsTrend),
      openDeals,
      openDealsTrend: Math.round(openDealsTrend),
      totalRevenue,
      totalRevenueTrend: Math.round(revenueTrend),
      tasksDueToday,
      tasksDueTodayTrend: Math.round(tasksDueTodayTrend),
    },
    loading: false,
  };
}
export default useDashboardStats;
