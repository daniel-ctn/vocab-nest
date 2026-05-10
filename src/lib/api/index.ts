import {
  AuthResponseSchema,
  CreateGroupRequestSchema,
  CreateVocabularyRequestSchema,
  DashboardSummaryResponseSchema,
  DeleteResponseSchema,
  GroupDetailResponseSchema,
  GroupListResponseSchema,
  GroupVocabularyResponseSchema,
  LoginRequestSchema,
  MeResponseSchema,
  PracticeCompleteResponseSchema,
  PracticeReviewRequestSchema,
  PracticeReviewResponseSchema,
  RegisterRequestSchema,
  TodayPracticeResponseSchema,
  UpdateGroupRequestSchema,
  UpdateVocabularyRequestSchema,
  VocabularyDetailResponseSchema,
  VocabularyGroupLinkRequestSchema,
  VocabularyGroupLinkResponseSchema,
  VocabularyListResponseSchema,
  VocabularySearchRequestSchema,
  VocabularySearchResponseSchema,
  type AuthResponse,
  type CreateGroupRequest,
  type CreateVocabularyRequest,
  type DashboardSummaryResponse,
  type DeleteResponse,
  type GroupDetailResponse,
  type GroupListResponse,
  type GroupVocabularyResponse,
  type LoginRequest,
  type MeResponse,
  type PracticeCompleteResponse,
  type PracticeReviewRequest,
  type PracticeReviewResponse,
  type RegisterRequest,
  type TodayPracticeResponse,
  type UpdateGroupRequest,
  type UpdateVocabularyRequest,
  type VocabularyDetailResponse,
  type VocabularyGroupLinkRequest,
  type VocabularyGroupLinkResponse,
  type VocabularyListResponse,
  type VocabularySearchRequest,
  type VocabularySearchResponse,
} from "@/lib/contracts";

import { apiRequest } from "./client";

const resourcePath = (base: string, id: string, suffix = "") =>
  `${base}/${encodeURIComponent(id)}${suffix}`;

export const api = {
  auth: {
    register(input: RegisterRequest): Promise<AuthResponse> {
      RegisterRequestSchema.parse(input);
      return apiRequest("/auth/register", AuthResponseSchema, {
        method: "POST",
        body: input,
        token: null,
      });
    },

    login(input: LoginRequest): Promise<AuthResponse> {
      LoginRequestSchema.parse(input);
      return apiRequest("/auth/login", AuthResponseSchema, {
        method: "POST",
        body: input,
        token: null,
      });
    },

    me(): Promise<MeResponse> {
      return apiRequest("/auth/me", MeResponseSchema);
    },
  },

  vocabulary: {
    search(input: VocabularySearchRequest): Promise<VocabularySearchResponse> {
      VocabularySearchRequestSchema.parse(input);
      return apiRequest(
        "/vocabulary/search",
        VocabularySearchResponseSchema,
        {
          method: "POST",
          body: input,
        },
      );
    },

    create(input: CreateVocabularyRequest): Promise<VocabularyDetailResponse> {
      CreateVocabularyRequestSchema.parse(input);
      return apiRequest("/vocabulary", VocabularyDetailResponseSchema, {
        method: "POST",
        body: input,
      });
    },

    list(): Promise<VocabularyListResponse> {
      return apiRequest("/vocabulary", VocabularyListResponseSchema);
    },

    get(id: string): Promise<VocabularyDetailResponse> {
      return apiRequest(
        resourcePath("/vocabulary", id),
        VocabularyDetailResponseSchema,
      );
    },

    update(
      id: string,
      input: UpdateVocabularyRequest,
    ): Promise<VocabularyDetailResponse> {
      UpdateVocabularyRequestSchema.parse(input);
      return apiRequest(
        resourcePath("/vocabulary", id),
        VocabularyDetailResponseSchema,
        {
          method: "PATCH",
          body: input,
        },
      );
    },

    delete(id: string): Promise<DeleteResponse> {
      return apiRequest(resourcePath("/vocabulary", id), DeleteResponseSchema, {
        method: "DELETE",
      });
    },

    addToGroup(
      id: string,
      input: VocabularyGroupLinkRequest,
    ): Promise<VocabularyGroupLinkResponse> {
      VocabularyGroupLinkRequestSchema.parse(input);
      return apiRequest(
        resourcePath("/vocabulary", id, "/groups"),
        VocabularyGroupLinkResponseSchema,
        {
          method: "POST",
          body: input,
        },
      );
    },
  },

  groups: {
    create(input: CreateGroupRequest): Promise<GroupDetailResponse> {
      CreateGroupRequestSchema.parse(input);
      return apiRequest("/groups", GroupDetailResponseSchema, {
        method: "POST",
        body: input,
      });
    },

    list(): Promise<GroupListResponse> {
      return apiRequest("/groups", GroupListResponseSchema);
    },

    get(id: string): Promise<GroupDetailResponse> {
      return apiRequest(resourcePath("/groups", id), GroupDetailResponseSchema);
    },

    update(id: string, input: UpdateGroupRequest): Promise<GroupDetailResponse> {
      UpdateGroupRequestSchema.parse(input);
      return apiRequest(resourcePath("/groups", id), GroupDetailResponseSchema, {
        method: "PATCH",
        body: input,
      });
    },

    delete(id: string): Promise<DeleteResponse> {
      return apiRequest(resourcePath("/groups", id), DeleteResponseSchema, {
        method: "DELETE",
      });
    },

    vocabulary(id: string): Promise<GroupVocabularyResponse> {
      return apiRequest(
        resourcePath("/groups", id, "/vocabulary"),
        GroupVocabularyResponseSchema,
      );
    },
  },

  practice: {
    today(): Promise<TodayPracticeResponse> {
      return apiRequest("/practice/today", TodayPracticeResponseSchema);
    },

    reviewItem(
      practiceId: string,
      itemId: string,
      input: PracticeReviewRequest,
    ): Promise<PracticeReviewResponse> {
      PracticeReviewRequestSchema.parse(input);
      return apiRequest(
        `/practice/${encodeURIComponent(practiceId)}/items/${encodeURIComponent(
          itemId,
        )}/review`,
        PracticeReviewResponseSchema,
        {
          method: "POST",
          body: input,
        },
      );
    },

    complete(practiceId: string): Promise<PracticeCompleteResponse> {
      return apiRequest(
        resourcePath("/practice", practiceId, "/complete"),
        PracticeCompleteResponseSchema,
        {
          method: "POST",
        },
      );
    },
  },

  dashboard: {
    summary(): Promise<DashboardSummaryResponse> {
      return apiRequest("/dashboard/summary", DashboardSummaryResponseSchema);
    },
  },
};

export * from "./client";
export * from "./errors";
