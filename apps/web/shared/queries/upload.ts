import type {
  ApiResponse,
  UploadSignRequest,
  UploadSignResponse,
} from "@chanban/shared-types";
import { httpClient } from "@/lib/httpClient";

export const uploadDomains = {
  /**
   * 서버에서 Supabase Storage signed upload URL을 발급받는다.
   */
  signUpload: async (
    body: UploadSignRequest
  ): Promise<UploadSignResponse> => {
    const res = await httpClient.post<
      ApiResponse<UploadSignResponse>,
      UploadSignRequest
    >("/api/uploads/sign", body);
    return res.data;
  },
};
