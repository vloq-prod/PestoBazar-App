import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import AppNavbar from '../../src/components/comman/AppNavbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { useResponsive } from '../../src/utils/useResponsive';
import {
  Bell,
  ShoppingBag,
  Info,
  AlertTriangle,
  Gift,
  CheckCheck,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { useAppVisitorStore } from '../../src/store/auth';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useUnreadNotificationCount,
} from '../../src/hooks/useNotifications';
import { useToast } from '../../src/context/ToastContext';
import { useQueryClient } from '@tanstack/react-query';
import { Notification } from '../../src/types/notification.type';
import { resolveNotification } from '../../src/deep-linking/resolver/deep-link-resolver';

const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { spacing, font } = useResponsive();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { visitorId, userId } = useAppVisitorStore((state) => state);
  const numericUserId = userId ? Number(userId) : undefined;

  const [page, setPage] = useState(1);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch notifications hookc
  const { data: notificationsData, isLoading, isFetching } = useNotifications({
    user_id: numericUserId,
    visitor_id: visitorId || undefined,
    page,
  });

  // Unread count hook
  const { data: unreadCountData } = useUnreadNotificationCount({
    user_id: numericUserId,
    visitor_id: visitorId || undefined,
  });

  const unreadCount = unreadCountData?.data?.unread_count ?? 0;

  // Mutations
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllPending } = useMarkAllNotificationsAsRead();

  // Sync data to local state
  useEffect(() => {
    if (notificationsData?.data?.notifications) {
      if (page === 1) {
        setNotificationsList(notificationsData.data.notifications);
      } else {
        setNotificationsList((prev) => {
          // Prevent duplicates
          const existingIds = new Set(prev.map((n) => n.id));
          const newNotifications = notificationsData.data.notifications.filter(
            (n) => !existingIds.has(n.id)
          );
          return [...prev, ...newNotifications];
        });
      }
    }
  }, [notificationsData, page]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    const hasMore = notificationsData?.data?.pagination?.has_more;
    if (hasMore && !isFetching && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleMarkAsRead = (notification: Notification) => {
    // 1. If not read, mark as read
    if (!notification.is_read) {
      // Optimistic UI Update
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );

      markAsRead(
        {
          notificationId: notification.id,
          user_id: numericUserId,
          visitor_id: visitorId || undefined,
        },
        {
          onSuccess: (res) => {
            if (res.status) {
              queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
            }
          },
          onError: () => {
            // Revert optimistic update
            setNotificationsList((prev) =>
              prev.map((n) => (n.id === notification.id ? { ...n, is_read: false } : n))
            );
          },
        }
      );
    }

    // 2. Perform navigation action
    try {
      const navPayload = {
        ...notification.data,
        action_type: notification.action_type,
        action_value: notification.action_value,
      };
      resolveNotification(navPayload);
    } catch (error) {
      console.error("[Notifications] Failed to resolve navigation action:", error);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0 || isMarkingAllPending) return;

    // Optimistic UI Update
    setNotificationsList((prev) => prev.map((n) => ({ ...n, is_read: true })));

    markAllAsRead(
      {
        user_id: numericUserId,
        visitor_id: visitorId || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.status) {
            showToast(res.message || 'All notifications marked as read', 'success');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        },
        onError: (err: any) => {
          showToast(err?.message || 'Failed to mark all as read', 'error');
          // Invalidate to fetch correct status
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
      }
    );
  };

  const getNotificationIcon = (type: string) => {
    const size = 22;
    switch (type?.toLowerCase()) {
      case 'order':
      case 'order_status':
        return {
          icon: <ShoppingBag size={size} color={colors.primary} />,
          bgColor: colors.primary + '15',
        };
      case 'offer':
      case 'promo':
        return {
          icon: <Gift size={size} color="#EAB308" />,
          bgColor: '#EAB30815',
        };
      case 'alert':
      case 'warning':
        return {
          icon: <AlertTriangle size={size} color={colors.error} />,
          bgColor: colors.error + '15',
        };
      default:
        return {
          icon: <Info size={size} color="#3B82F6" />,
          bgColor: '#3B82F615',
        };
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const { icon, bgColor } = getNotificationIcon(item.notification_type);
    
    // Support multiple field names from backend API variations
    const imageUrl = item.image_url || (item as any).image || item.data?.image_url || item.data?.image;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleMarkAsRead(item)}
        style={[
          styles.notificationCard,
          {
            backgroundColor: item.is_read ? colors.surface : colors.primary + '05',
            borderColor: colors.border,
          },
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.notificationImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            {icon}
          </View>
        )}

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.itemTitle,
                {
                  color: colors.text,
                  fontSize: font(14),
                  fontFamily: item.is_read ? 'Poppins_500Medium' : 'Poppins_600SemiBold',
                },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.is_read && (
              <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
          </View>

          <Text
            style={[
              styles.itemDescription,
              {
                color: colors.textSecondary,
                fontSize: font(12.5),
              },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          <Text
            style={[
              styles.timeText,
              {
                color: colors.textSecondary,
                fontSize: font(11),
              },
            ]}
          >
            {item.created_at_human}
          </Text>
        </View>

        <ChevronRight size={16} color={colors.textSecondary} style={{ opacity: 0.5 }} />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (notificationsList.length === 0) return null;
    return (
      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderTitle, { color: colors.text, fontSize: font(14) }]}>
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'All caught up!'}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={handleMarkAllAsRead}
            disabled={isMarkingAllPending}
            activeOpacity={0.7}
          >
            <CheckCheck size={16} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.markAllText, { color: colors.primary, fontSize: font(12.5) }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.centerContainer}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primary + '12' }]}>
        <Bell size={44} color={colors.primary} fill={colors.primary + '20'} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontSize: font(18) }]}>
        No notifications yet
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: font(13.5) }]}>
        We will notify you here when there are updates on your orders, special promos, or security alerts.
      </Text>
    </View>
  );

  const renderSkeletonLoader = () => (
    <View style={{ padding: spacing(16), gap: spacing(12) }}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View
          key={key}
          style={[
            styles.skeletonCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.skeletonIcon, { backgroundColor: colors.border }]} />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.border }]} />
            <View style={[styles.skeletonLine, { width: '90%', backgroundColor: colors.border }]} />
            <View style={[styles.skeletonLine, { width: '30%', backgroundColor: colors.border }]} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" />
      <AppNavbar title="Notifications" showBack hideBorder />

      {isLoading && page === 1 ? (
        renderSkeletonLoader()
      ) : (
        <FlatList
          data={notificationsList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotificationItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing(20),
            paddingHorizontal: spacing(16),
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isFetching && page > 1 ? (
              <View style={{ paddingVertical: spacing(20), alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 21,
    opacity: 0.8,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 6,
  },
  listHeaderTitle: {
    fontFamily: 'Poppins_500Medium',
    opacity: 0.8,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: {
    fontFamily: 'Poppins_600SemiBold',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 6,
  },
  itemDescription: {
    fontFamily: 'Poppins_400Regular',
    lineHeight: 18,
    marginBottom: 6,
  },
  timeText: {
    fontFamily: 'Poppins_400Regular',
    opacity: 0.6,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    opacity: 0.12,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    opacity: 0.12,
  },
});

