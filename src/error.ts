import * as core from "@actions/core";
import type { AxiosError } from "axios";

function isAxiosError(e: any): e is AxiosError {
  return !!e.isAxiosError;
}

export function logError(e: unknown) {
  if (isAxiosError(e)) {
    core.error(`API Request failed: ${e.config.url}`);
    core.error(`   ${e.response?.data}`);
  } else if (e instanceof Error) {
    if (e.stack) core.error(e.stack);
  }
}

export function withMessage(message: string) {
  return (e: unknown) => {
    core.error(message);
    logError(e);
  };
}
