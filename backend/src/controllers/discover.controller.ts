import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { Event } from '../models/Event.js';
import { EventRSVP } from '../models/EventRSVP.js';
import { Group } from '../models/Group.js';
import { GroupMember } from '../models/GroupMember.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';

export async function getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { radius, hub, search } = req.query;
    const filter: Record<string, any> = {};

    if (radius) {
      filter.miles = { $lte: Number(radius) };
    }

    if (hub && hub !== 'events') {
      filter.hub = hub;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { when: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { note: { $regex: q, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter).sort({ featured: -1, miles: 1 });
    sendSuccess(res, events);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching events', 500);
  }
}

export async function toggleEventRSVP(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      sendError(res, 'Event not found', 404);
      return;
    }

    const existing = await EventRSVP.findOne({ user: user._id, event: event._id });
    let attending = false;

    if (existing) {
      await existing.deleteOne();
      event.goingCount = Math.max(0, event.goingCount - 1);
    } else {
      await EventRSVP.create({ user: user._id, event: event._id });
      event.goingCount += 1;
      attending = true;
    }

    await event.save();
    sendSuccess(res, { attending, going: event.goingCount });
  } catch (error: any) {
    sendError(res, error.message || 'Error toggling RSVP', 500);
  }
}

export async function getMyRSVPs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const rsvps = await EventRSVP.find({ user: user._id });
    const rsvpIds = rsvps.map((r) => r.event.toString());
    sendSuccess(res, rsvpIds);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching RSVPs', 500);
  }
}

export async function getGroups(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { radius, hub, search } = req.query;
    const filter: Record<string, any> = {};

    if (radius) {
      filter.miles = { $lte: Number(radius) };
    }

    if (hub) {
      filter.hub = hub;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
      ];
    }

    const groups = await Group.find(filter).sort({ miles: 1 });
    sendSuccess(res, groups);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching groups', 500);
  }
}

export async function toggleGroup(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { id } = req.params;
    const group = await Group.findById(id);
    if (!group) {
      sendError(res, 'Group not found', 404);
      return;
    }

    const existing = await GroupMember.findOne({ user: user._id, group: group._id });
    let joined = false;

    if (existing) {
      await existing.deleteOne();
      group.membersCount = Math.max(0, group.membersCount - 1);
    } else {
      await GroupMember.create({ user: user._id, group: group._id });
      group.membersCount += 1;
      joined = true;
    }

    await group.save();
    sendSuccess(res, { joined, members: group.membersCount });
  } catch (error: any) {
    sendError(res, error.message || 'Error toggling group', 500);
  }
}

export async function getMyGroups(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const memberships = await GroupMember.find({ user: user._id });
    const groupIds = memberships.map((m) => m.group.toString());
    sendSuccess(res, groupIds);
  } catch (error: any) {
    sendError(res, error.message || 'Error fetching joined groups', 500);
  }
}

export function getTopics(_req: any, res: Response): void {
  const topics = [
    { id: 'festival', label: '#FallFestival' },
    { id: 'detour', label: '#MapleStDetour', alert: true },
    { id: 'tools', label: '#ToolLibrary' },
    { id: 'dogs', label: '#DogWalkersClub' },
    { id: 'safety', label: '#CommunitySafety' },
  ];
  sendSuccess(res, topics);
}

