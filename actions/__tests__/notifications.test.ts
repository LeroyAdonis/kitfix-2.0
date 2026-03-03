import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/auth-utils", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/db/queries/notifications", () => ({
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  getUnreadNotifications: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks — vi.mock is hoisted automatically)
// ---------------------------------------------------------------------------

import { getSession } from "@/lib/auth-utils";
import {
  markAsRead,
  markAllAsRead,
  getUnreadNotifications,
} from "@/lib/db/queries/notifications";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  getUnreadNotificationsAction,
} from "../notifications";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSession(role = "customer", userId = "user-1") {
  return {
    user: {
      id: userId,
      name: "Test User",
      email: "test@example.com",
      role,
      emailVerified: true,
      image: null,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: "sess-1",
      userId,
      token: "test-token",
      expiresAt: new Date(Date.now() + 86400000),
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      impersonatedBy: null,
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

describe("markNotificationReadAction", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await markNotificationReadAction("notif-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(markAsRead).not.toHaveBeenCalled();
  });

  it("marks the notification as read and returns success", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(markAsRead).mockResolvedValueOnce({
      id: "notif-1",
      userId: "user-1",
      type: "status_update",
      title: "Test",
      message: "Test message",
      repairRequestId: null,
      isRead: true,
      createdAt: new Date(),
    });

    const result = await markNotificationReadAction("notif-1");

    expect(result).toEqual({ success: true, data: { notificationId: "notif-1" } });
    expect(markAsRead).toHaveBeenCalledWith("notif-1");
  });

  it("returns error when markAsRead throws", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(markAsRead).mockRejectedValueOnce(new Error("DB error"));

    const result = await markNotificationReadAction("notif-1");

    expect(result).toEqual({
      success: false,
      error: "Failed to mark notification as read",
    });
  });
});

describe("markAllNotificationsReadAction", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await markAllNotificationsReadAction();

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(markAllAsRead).not.toHaveBeenCalled();
  });

  it("marks all notifications as read for the current user", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-42"));
    vi.mocked(markAllAsRead).mockResolvedValueOnce(undefined);

    const result = await markAllNotificationsReadAction();

    expect(result).toEqual({ success: true, data: { success: true } });
    expect(markAllAsRead).toHaveBeenCalledWith("user-42");
  });

  it("returns error when markAllAsRead throws", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(markAllAsRead).mockRejectedValueOnce(new Error("DB error"));

    const result = await markAllNotificationsReadAction();

    expect(result).toEqual({
      success: false,
      error: "Failed to mark all notifications as read",
    });
  });
});

describe("getUnreadNotificationsAction", () => {
  it("returns Unauthorized when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await getUnreadNotificationsAction();

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(getUnreadNotifications).not.toHaveBeenCalled();
  });

  it("returns unread notifications for the current user", async () => {
    const notifications = [
      {
        id: "notif-1",
        userId: "user-1",
        type: "status_update" as const,
        title: "Status Update",
        message: "Your repair is in progress",
        repairRequestId: "repair-1",
        isRead: false,
        createdAt: new Date(),
      },
      {
        id: "notif-2",
        userId: "user-1",
        type: "payment" as const,
        title: "Payment Due",
        message: "Please pay",
        repairRequestId: "repair-2",
        isRead: false,
        createdAt: new Date(),
      },
    ];

    vi.mocked(getSession).mockResolvedValueOnce(mockSession("customer", "user-1"));
    vi.mocked(getUnreadNotifications).mockResolvedValueOnce(notifications);

    const result = await getUnreadNotificationsAction();

    expect(result).toEqual({ success: true, data: notifications });
    expect(getUnreadNotifications).toHaveBeenCalledWith("user-1");
  });

  it("returns error when getUnreadNotifications throws", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(mockSession());
    vi.mocked(getUnreadNotifications).mockRejectedValueOnce(new Error("DB error"));

    const result = await getUnreadNotificationsAction();

    expect(result).toEqual({
      success: false,
      error: "Failed to fetch notifications",
    });
  });
});
