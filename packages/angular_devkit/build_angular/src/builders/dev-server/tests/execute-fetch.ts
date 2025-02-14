/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { lastValueFrom, mergeMap, take, timeout } from 'rxjs';
import { URL } from 'url';
import {
  BuilderHarness,
  BuilderHarnessExecutionOptions,
  BuilderHarnessExecutionResult,
} from '../../../testing/builder-harness';

export async function executeOnceAndFetch<T>(
  harness: BuilderHarness<T>,
  url: string,
  options?: Partial<BuilderHarnessExecutionOptions> & { request?: RequestInit },
): Promise<BuilderHarnessExecutionResult & { response?: Response }> {
  return lastValueFrom(
    harness.execute().pipe(
      timeout(30000),
      mergeMap(async (executionResult) => {
        let response = undefined;
        if (executionResult.result?.success) {
          let baseUrl = `${executionResult.result.baseUrl}`;
          baseUrl = baseUrl[baseUrl.length - 1] === '/' ? baseUrl : `${baseUrl}/`;
          const resolvedUrl = new URL(url, baseUrl);
          response = await fetch(resolvedUrl, options?.request);
        }

        return { ...executionResult, response };
      }),
      take(1),
    ),
  );
}
