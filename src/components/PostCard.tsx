import { Image, Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '../constants/theme';
import type { FeedPost } from '../types/post';
import { AppText } from './AppText';
import { Icon } from './Icon';

type PostCardProps = {
  post: FeedPost;
  onToggleAppreciation: (id: string) => void;
  onShare: (post: FeedPost) => void;
  onComments: (post: FeedPost) => void;
  onMore: (post: FeedPost) => void;
  onOpenAttachment: (post: FeedPost) => void;
  onOpen?: (post: FeedPost) => void;
};

export function PostCard({
  post,
  onToggleAppreciation,
  onShare,
  onComments,
  onMore,
  onOpenAttachment,
  onOpen,
}: PostCardProps) {
  const appreciatedColor =
    post.appreciationIcon === 'heart-outline' ? colors.error : colors.primary;
  return (
    <Pressable onPress={() => onOpen?.(post)} style={styles.card}>
      {post.accent === true ? <View style={styles.accent} /> : null}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          {post.authorKind === 'organization' ? (
            <View style={styles.orgAvatar}>
              <Icon color={colors.primaryContainer} name="bank" size={22} />
            </View>
          ) : null}
          {post.authorKind === 'photo' && post.photo !== undefined ? (
            <Image source={post.photo} style={styles.photoAvatar} />
          ) : null}
          {post.authorKind === 'initials' ? (
            <View style={styles.initialsAvatar}>
              <AppText color={colors.onSecondaryContainer} variant="labelLg">
                {post.initials}
              </AppText>
            </View>
          ) : null}
          <View style={styles.authorCopy}>
            <View style={styles.nameRow}>
              <AppText variant="labelLg">{post.authorName}</AppText>
              {post.verified === true ? (
                <Icon color={colors.primary} name="check-decagram" size={16} />
              ) : null}
              {post.authorMeta !== undefined && post.authorKind !== 'initials' ? (
                <AppText color={colors.onSurfaceVariant} variant="labelSm">
                  • {post.authorMeta}
                </AppText>
              ) : null}
              {post.authorKind === 'initials' && post.authorMeta !== undefined ? (
                <View style={styles.metaPill}>
                  <AppText color={colors.onSurfaceVariant} variant="labelSm">
                    {post.authorMeta}
                  </AppText>
                </View>
              ) : null}
            </View>
            <View style={styles.metaRow}>
              <AppText color={colors.onSurfaceVariant} variant="labelSm">
                {post.timeLabel}
              </AppText>
              {post.badge !== undefined ? (
                <View style={styles.metaRow}>
                  <AppText color={colors.onSurfaceVariant} variant="labelSm">
                    •
                  </AppText>
                  <Icon
                    color={
                      post.badge.tone === 'danger' ? colors.error : colors.primary
                    }
                    name={post.badge.icon}
                    size={12}
                  />
                  <AppText
                    color={
                      post.badge.tone === 'danger' ? colors.error : colors.primary
                    }
                    variant="labelSm"
                  >
                    {post.badge.label}
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>
        </View>
        <Pressable
          accessibilityLabel="More options"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => {
            onMore(post);
          }}
        >
          <Icon color={colors.onSurfaceVariant} name="dots-horizontal" size={22} />
        </Pressable>
      </View>
      <AppText variant="bodyMd">{post.body}</AppText>
      {post.attachment !== undefined ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            onOpenAttachment(post);
          }}
          style={({ pressed }) => {
            return [styles.attachment, pressed && styles.pressed];
          }}
        >
          <View style={styles.attachmentIcon}>
            <Icon color={colors.primary} name="map-outline" size={20} />
          </View>
          <View style={styles.attachmentCopy}>
            <AppText variant="labelMd">{post.attachment.title}</AppText>
            <AppText color={colors.onSurfaceVariant} variant="bodySm">
              {post.attachment.meta}
            </AppText>
          </View>
          <Icon color={colors.onSurfaceVariant} name="arrow-right" size={18} />
        </Pressable>
      ) : null}
      {post.image !== undefined ? (
        <View style={styles.imageWrap}>
          <Image source={post.image} style={styles.image} />
          {post.imageLabel !== undefined ? (
            <View style={styles.imageChip}>
              <Icon color={colors.onPrimary} name="map-marker" size={12} />
              <AppText color={colors.onPrimary} variant="labelSm">
                {post.imageLabel}
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}
      {post.recommendation !== undefined ? (
        <View style={styles.recommendation}>
          <Icon color={colors.primary} name="thumb-up-outline" size={18} />
          <AppText style={styles.recommendationText} variant="bodySm">
            <AppText color={colors.primary} variant="labelMd">
              {post.recommendation.author}
            </AppText>
            {' recommended '}
            <AppText variant="labelMd">{post.recommendation.business}</AppText>
            {`: “${post.recommendation.quote}”`}
          </AppText>
        </View>
      ) : null}
      <View style={styles.actions}>
        <View style={styles.actionGroup}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onToggleAppreciation(post.id);
            }}
            style={styles.action}
          >
            <Icon
              color={post.appreciated ? appreciatedColor : colors.onSurfaceVariant}
              name={
                post.appreciated
                  ? post.appreciationIcon === 'heart-outline'
                    ? 'heart'
                    : 'thumb-up'
                  : post.appreciationIcon
              }
              size={18}
            />
            <AppText
              color={post.appreciated ? appreciatedColor : colors.onSurfaceVariant}
              variant="labelMd"
            >
              {post.appreciation}
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onComments(post);
            }}
            style={styles.action}
          >
            <Icon color={colors.onSurfaceVariant} name="comment-outline" size={18} />
            <AppText color={colors.onSurfaceVariant} variant="labelMd">
              {post.commentsLabel}
            </AppText>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            onShare(post);
          }}
          style={styles.action}
        >
          <Icon color={colors.onSurfaceVariant} name="share-variant" size={18} />
          <AppText color={colors.onSurfaceVariant} variant="labelMd">
            Share
          </AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.45)',
    padding: 16,
    gap: 12,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primaryContainer,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  authorRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  authorCopy: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orgAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaPill: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.45)',
    padding: 12,
  },
  attachmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentCopy: {
    flex: 1,
    gap: 2,
  },
  imageWrap: {
    borderRadius: radii.md,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceContainer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageChip: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(42, 50, 42, 0.82)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recommendation: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(237, 246, 233, 0.8)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.35)',
    padding: 12,
  },
  recommendationText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(192, 201, 194, 0.6)',
    paddingTop: 10,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.8,
  },
});
