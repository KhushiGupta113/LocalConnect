import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamilies, radii } from '../constants/theme';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../hooks/useAuth';
import { useCommunity } from '../hooks/useCommunity';
import { presentPost } from '../services/feed';
import type { MainStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<MainStackParamList, 'PostDetails'>;

export function PostDetailsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const {
    posts,
    comments,
    toggleLike,
    toggleSaved,
    addComment,
    toggleCommentLike,
    toggleRsvp,
    rsvpIds,
    fetchCommentsForPost,
  } = useCommunity();
  const raw = posts.find((item) => item.id === route.params.postId);
  const post = raw === undefined ? undefined : presentPost(raw, user);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [sort, setSort] = useState<'relevant' | 'newest'>('relevant');
  const [expanded, setExpanded] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (route.params.postId) {
      fetchCommentsForPost(route.params.postId).catch(() => undefined);
    }
  }, [route.params.postId]);

  if (post === undefined) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 16 }]}>
        <AppText variant="headlineSm">This post is no longer available</AppText>
        <Pressable onPress={() => navigation.goBack()}><AppText color={colors.primary} variant="labelLg">Go back</AppText></Pressable>
      </View>
    );
  }

  const thread = comments
    .filter((comment) => comment.postId === post.id)
    .sort((left, right) => (sort === 'relevant' ? right.likes - left.likes : 0));
  const top = thread.filter((comment) => comment.parentId === undefined);
  const visible = expanded ? top : top.slice(0, 2);

  async function send() {
    const message = await addComment(post!.id, draft, replyTo ?? undefined);
    if (message !== null) {
      setError(message);
      return;
    }
    setDraft('');
    setReplyTo(null);
    setError(null);
    setExpanded(true);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()}><Icon name="arrow-left" size={24} /></Pressable>
        <View style={styles.grow}>
          <AppText color={colors.primary} variant="headlineSm">{post.location ?? 'Oakridge Commons'}</AppText>
          <AppText color={colors.onSurfaceVariant} variant="labelSm">{post.timeLabel}</AppText>
        </View>
        <Pressable onPress={() => toggleSaved(post.id)}>
          <Icon color={colors.primary} name={post.saved === true ? 'bookmark' : 'bookmark-outline'} size={22} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <PostCard
          onComments={() => undefined}
          onMore={() => toggleSaved(post.id)}
          onOpenAttachment={() => undefined}
          onShare={(item) => {
            Share.share({ message: item.body }).catch(() => undefined);
          }}
          onToggleAppreciation={toggleLike}
          post={post}
        />
        {post.poll !== undefined ? (
          <View style={styles.banner}>
            <AppText color={colors.primary} variant="labelLg">Poll</AppText>
            <AppText variant="bodyMd">{post.poll}</AppText>
          </View>
        ) : null}
        {post.category === 'events' ? (
          <View style={styles.banner}>
            <AppText color={colors.primary} variant="labelLg">Upcoming gathering</AppText>
            <Pressable onPress={() => toggleRsvp(post.id)} style={styles.rsvp}>
              <AppText color={colors.onPrimary} variant="labelMd">
                {rsvpIds.includes(post.id) ? 'Attending' : 'RSVP'}
              </AppText>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.rowBetween}>
          <AppText variant="headlineSm">Discussion ({thread.length})</AppText>
          <Pressable onPress={() => setSort((value) => (value === 'relevant' ? 'newest' : 'relevant'))}>
            <AppText color={colors.primary} variant="labelMd">{sort === 'relevant' ? 'Most relevant' : 'Newest'}</AppText>
          </Pressable>
        </View>
        {top.length === 0 ? <AppText color={colors.onSurfaceVariant} variant="bodySm">No comments yet. Be the first neighbor to reply.</AppText> : null}
        {visible.map((comment) => {
          const replies = thread.filter((item) => item.parentId === comment.id);
          return (
            <View key={comment.id} style={styles.comment}>
              <AppText variant="labelMd">{comment.authorName}</AppText>
              <AppText color={colors.onSurfaceVariant} variant="labelSm">{comment.authorMeta} • {comment.timeLabel}</AppText>
              <AppText variant="bodyMd">{comment.body}</AppText>
              <View style={styles.row}>
                <Pressable onPress={() => toggleCommentLike(comment.id)} style={styles.row}>
                  <Icon color={comment.liked ? colors.error : colors.onSurfaceVariant} name={comment.liked ? 'heart' : 'heart-outline'} size={16} />
                  <AppText variant="labelSm">{comment.likes}</AppText>
                </Pressable>
                <Pressable onPress={() => setReplyTo(comment.id)}>
                  <AppText color={colors.primary} variant="labelSm">Reply</AppText>
                </Pressable>
              </View>
              {replies.map((reply) => (
                <View key={reply.id} style={styles.reply}>
                  <AppText variant="labelMd">{reply.authorName}{reply.isAuthor === true ? ' · You' : ''}</AppText>
                  <AppText variant="bodyMd">{reply.body}</AppText>
                </View>
              ))}
            </View>
          );
        })}
        {top.length > 2 ? (
          <Pressable onPress={() => setExpanded((value) => !value)}>
            <AppText color={colors.primary} variant="labelMd">{expanded ? 'Show fewer comments' : `View remaining ${top.length - 2} comments`}</AppText>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => {
            if (user === null) {
              return;
            }
            const delta = connected ? -1 : 1;
            setConnected(!connected);
            updateProfile({ followingCount: user.followingCount + delta });
          }}
        >
          <AppText color={colors.primary} variant="labelMd">{connected ? 'Connected' : `Connect with ${post.authorName}`}</AppText>
        </Pressable>
      </ScrollView>
      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          onChangeText={setDraft}
          placeholder={replyTo === null ? 'Add a comment' : 'Write a reply'}
          placeholderTextColor="rgba(64,73,68,0.55)"
          style={styles.input}
          value={draft}
        />
        <Pressable onPress={send}><AppText color={colors.primary} variant="labelLg">Send</AppText></Pressable>
      </View>
      {error !== null ? <AppText color={colors.error} style={styles.error} variant="labelSm">{error}</AppText> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  missing: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: 20, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingBottom: 8 },
  grow: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  banner: { backgroundColor: colors.surfaceContainerLow, borderRadius: radii.md, padding: 14, gap: 8 },
  rsvp: { alignSelf: 'flex-start', backgroundColor: colors.primaryContainer, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  comment: { backgroundColor: colors.surfaceContainerLowest, borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(192,201,194,0.4)', padding: 12, gap: 4 },
  reply: { marginLeft: 12, borderLeftWidth: 2, borderLeftColor: colors.surfaceContainerHigh, paddingLeft: 10, gap: 2 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest },
  input: { flex: 1, minHeight: 40, color: colors.onSurface, fontFamily: fontFamilies.regular, fontSize: 14 },
  error: { paddingHorizontal: 16, paddingBottom: 6 },
});
