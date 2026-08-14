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
  Truck,
  Heart,
  Percent,
  Megaphone,
  BookOpen,
  Ticket,
  MoreVertical,
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


  const [page, setPage] = useState(1);
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Fetch notifications hookc
  const { data: notificationsData, isLoading, isFetching } = useNotifications({
    user_id: userId || undefined,
    visitor_id: visitorId || undefined,
    page,
  });

  // Unread count hook
  const { data: unreadCountData } = useUnreadNotificationCount({
    user_id: userId || undefined,
    visitor_id: visitorId || undefined,
  });

  const unreadCount = unreadCountData?.data?.unread_count ?? 0;

  // Mutations
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllPending } = useMarkAllNotificationsAsRead();

  // Sync data to local state
  useEffect(() => {
    if (notificationsData?.data?.notifications && notificationsData.data.notifications.length > 0) {
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
    } else if (!isLoading && page === 1) {
      // Load local dummy notifications for UI design & deep-linking test when DB has 0 notifications
      setNotificationsList(DUMMY_TEST_NOTIFICATIONS);
    }
  }, [notificationsData, page, isLoading]);

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
          user_id: userId || undefined,
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

  const hasUnreadLocally = notificationsList.some(n => !n.is_read);
  const canMarkAllAsRead = unreadCount > 0 || hasUnreadLocally;

  const handleMarkAllAsRead = () => {
    if (!canMarkAllAsRead || isMarkingAllPending) return;

    // Optimistic UI Update
    setNotificationsList((prev) => prev.map((n) => ({ ...n, is_read: true })));

    markAllAsRead(
      {
        user_id: userId || undefined,
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
    setIsMenuVisible(false);
  };

  const getNotificationIcon = (type: string) => {
    const size = 16;
    const lowerType = type?.toLowerCase() || '';

    // Match icons according to the screen type but use primary color for all
    if (lowerType.includes('order')) {
      return {
        icon: <Truck size={size} color={colors.primary} />,
      };
    }
    if (lowerType.includes('offer') || lowerType.includes('promo') || lowerType.includes('coupon')) {
      return {
        icon: <Ticket size={size} color={colors.primary} />,
      };
    }
    if (lowerType.includes('gift') || lowerType.includes('reward')) {
      return {
        icon: <Gift size={size} color={colors.primary} />,
      };
    }
    if (lowerType.includes('cart') || lowerType.includes('wishlist') || lowerType.includes('whishlist')) {
      return {
        icon: <Heart size={size} color={colors.primary} />,
      };
    }
    if (lowerType.includes('edu') || lowerType.includes('diy') || lowerType.includes('info')) {
      return {
        icon: <BookOpen size={size} color={colors.primary} />,
      };
    }
    if (lowerType.includes('announcement') || lowerType.includes('alert') || lowerType.includes('warning')) {
      return {
        icon: <Megaphone size={size} color={colors.primary} />,
      };
    }
    
    // Default / General
    return {
      icon: <Bell size={size} color={colors.primary} />,
    };
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const { icon } = getNotificationIcon(item.notification_type || item.action_type);
    
    // Support multiple field names from backend API variations
    const imageUrl = item.image_url || (item as any).image || item.data?.image_url || item.data?.image;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleMarkAsRead(item)}
        style={[
          styles.notificationCard,
          {
            backgroundColor: item.is_read ? colors.surface : colors.primary + '0D',
            borderBottomColor: colors.border,
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
          <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF', borderColor: colors.primary, borderWidth: 1.5 }]}>
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
                  fontSize: font(13.5),
                  fontFamily: item.is_read ? 'Poppins_500Medium' : 'Poppins_600SemiBold',
                },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            
            <Text
              style={[
                styles.timeText,
                {
                  color: colors.textSecondary,
                  fontSize: font(11),
                  fontFamily: 'Poppins_400Regular',
                },
              ]}
            >
              {item.created_at_human}
            </Text>
          </View>

          <Text
            style={[
              styles.itemDescription,
              {
                color: colors.textSecondary,
                fontSize: font(12.5),
                lineHeight: 18,
              },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>
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
      <AppNavbar
        title="Notifications"
        showBack
        hideBorder
        rightComponent={
          <View style={styles.menuContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Notification options"
              onPress={() => setIsMenuVisible((visible) => !visible)}
              style={styles.moreButton}
            >
              <MoreVertical size={22} color={colors.text} />
            </TouchableOpacity>
            {isMenuVisible && (
              <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={!canMarkAllAsRead || isMarkingAllPending}
                  onPress={handleMarkAllAsRead}
                  style={styles.menuAction}
                >
                  <CheckCheck
                    size={17}
                    color={!canMarkAllAsRead ? colors.textSecondary : colors.primary}
                  />
                  <Text style={[styles.menuActionText, { color: !canMarkAllAsRead ? colors.textSecondary : colors.text }]}>
                    {isMarkingAllPending ? 'Marking as read…' : 'Mark all as read'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
      />

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
    paddingHorizontal: 16,
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
  menuContainer: {
    position: 'relative',
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    position: 'absolute',
    top: 42,
    right: 0,
    minWidth: 190,
    borderWidth: 1,
    borderRadius: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    zIndex: 10,
  },
  menuAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuActionText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  notificationImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 26,
  },
  contentContainer: {
    flex: 1,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
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

const DUMMY_TEST_NOTIFICATIONS: Notification[] = [
  {
    id: 101,
    source_type: "system",
    source_entity_type: "product",
    source_entity_id: 12,
    event_key: "product_deal",
    notification_type: "promo",
    title: "Hot Deal: Termite Control Spray! 🐜",
    description: "Get 20% off on this top-rated Termite spray. Tap to buy now.",
    image_url: "https://pestobazaar.confidevtech.com/storage/test-notifications/fZJaBGWbHBSh04cN0or5SKpvV1dfOVt6zH4BP5Ig.png",
    action_type: "product",
    action_value: "12",
    data: { id: "12", product_id: "12" },
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    created_at_human: "Just now",
  },
  {
    id: 102,
    source_type: "system",
    source_entity_type: "category",
    source_entity_id: 1,
    event_key: "category_promo",
    notification_type: "promo",
    title: "Explore Herbal Pest Control 🌿",
    description: "Safe for kids and pets. Browse our organic selections.",
    image_url: null,
    action_type: "category",
    action_value: "pest-control",
    data: { slug: "pest-control", category_slug: "pest-control" },
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    created_at_human: "5 mins ago",
  },
  {
    id: 103,
    source_type: "system",
    source_entity_type: "shop",
    source_entity_id: 1,
    event_key: "shop_listings",
    notification_type: "info",
    title: "Complete Product Catalog 🛒",
    description: "Checkout our complete catalog for chemical & herbal controls.",
    image_url: null,
    action_type: "shop",
    action_value: "",
    data: {},
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    created_at_human: "1 hour ago",
  },
  {
    id: 104,
    source_type: "system",
    source_entity_type: "cart",
    source_entity_id: 1,
    event_key: "cart_reminder",
    notification_type: "info",
    title: "Items waiting in your cart! 🛍️",
    description: "Don't let them sell out. Complete your order today.",
    image_url: null,
    action_type: "cart",
    action_value: "",
    data: {},
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    created_at_human: "3 hours ago",
  },
  {
    id: 105,
    source_type: "system",
    source_entity_type: "checkout",
    source_entity_id: 1,
    event_key: "checkout_resume",
    notification_type: "alert",
    title: "Complete your booking now!",
    description: "Proceed to checkout to finalize your pest control service.",
    image_url: null,
    action_type: "checkout",
    action_value: "",
    data: {},
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    created_at_human: "1 day ago",
  },
  {
    id: 106,
    source_type: "system",
    source_entity_type: "order",
    source_entity_id: 456,
    event_key: "order_details",
    notification_type: "order",
    title: "Technician Dispatched 🚚",
    description: "Your service technician is on the way for Order #456.",
    image_url: null,
    action_type: "order_details",
    action_value: "456",
    data: { id: "456", order_id: "456" },
    is_read: true,
    read_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    created_at_human: "2 days ago",
  },
  {
    id: 107,
    source_type: "system",
    source_entity_type: "coupons",
    source_entity_id: 1,
    event_key: "coupons_offers",
    notification_type: "promo",
    title: "Flat 50% Coupon Code Inside! 🏷️",
    description: "Tap to unlock exclusive promo codes on your first order.",
    image_url: null,
    action_type: "coupons",
    action_value: "",
    data: {},
    is_read: true,
    read_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    created_at_human: "3 days ago",
  },
  {
    id: 108,
    source_type: "system",
    source_entity_type: "diy",
    source_entity_id: 1,
    event_key: "diy_guides",
    notification_type: "info",
    title: "DIY Pest Control at Home 🛠️",
    description: "Simple guides and tricks to keep bugs away naturally.",
    image_url: null,
    action_type: "diy",
    action_value: "",
    data: {},
    is_read: true,
    read_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    created_at_human: "4 days ago",
  },
  {
    id: 109,
    source_type: "system",
    source_entity_type: "bulk",
    source_entity_id: 1,
    event_key: "bulk_orders",
    notification_type: "info",
    title: "Commercial Pest Services",
    description: "Need bulk orders for your office/store? Fill out our form.",
    image_url: null,
    action_type: "bulkorder",
    action_value: "",
    data: {},
    is_read: true,
    read_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    created_at_human: "5 days ago",
  },
];
