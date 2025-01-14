/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { KubernetesBackendClient } from './api/KubernetesBackendClient';
import { kubernetesApiRef, kubernetesProxyApiRef } from './api/types';
import { kubernetesAuthProvidersApiRef } from './kubernetes-auth-provider/types';
import { KubernetesAuthProviders } from './kubernetes-auth-provider/KubernetesAuthProviders';
import {
  createApiFactory,
  createPlugin,
  createRouteRef,
  discoveryApiRef,
  identityApiRef,
  gitlabAuthApiRef,
  googleAuthApiRef,
  microsoftAuthApiRef,
  oktaAuthApiRef,
  oneloginAuthApiRef,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { KubernetesProxyClient } from './api';

export const rootCatalogKubernetesRouteRef = createRouteRef({
  id: 'kubernetes',
});

export const kubernetesPlugin = createPlugin({
  id: 'kubernetes',
  apis: [
    createApiFactory({
      api: kubernetesApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
        kubernetesAuthProvidersApi: kubernetesAuthProvidersApiRef,
      },
      factory: ({ discoveryApi, identityApi, kubernetesAuthProvidersApi }) =>
        new KubernetesBackendClient({
          discoveryApi,
          identityApi,
          kubernetesAuthProvidersApi,
        }),
    }),
    createApiFactory({
      api: kubernetesProxyApiRef,
      deps: {
        kubernetesApi: kubernetesApiRef,
      },
      factory: ({ kubernetesApi }) =>
        new KubernetesProxyClient({
          kubernetesApi,
        }),
    }),
    createApiFactory({
      api: kubernetesAuthProvidersApiRef,
      deps: {
        gitlabAuthApi: gitlabAuthApiRef,
        googleAuthApi: googleAuthApiRef,
        microsoftAuthApi: microsoftAuthApiRef,
        oktaAuthApi: oktaAuthApiRef,
        oneloginAuthApi: oneloginAuthApiRef,
      },
      factory: ({
        gitlabAuthApi,
        googleAuthApi,
        microsoftAuthApi,
        oktaAuthApi,
        oneloginAuthApi,
      }) => {
        const oidcProviders = {
          gitlab: gitlabAuthApi,
          google: googleAuthApi,
          microsoft: microsoftAuthApi,
          okta: oktaAuthApi,
          onelogin: oneloginAuthApi,
        };

        return new KubernetesAuthProviders({ googleAuthApi, oidcProviders });
      },
    }),
  ],
  routes: {
    entityContent: rootCatalogKubernetesRouteRef,
  },
});

/**
 * Props of EntityKubernetesContent
 *
 * @public
 */
export type EntityKubernetesContentProps = {
  /**
   * Sets the refresh interval in milliseconds. The default value is 10000 (10 seconds)
   */
  refreshIntervalMs?: number;
};

export const EntityKubernetesContent: (
  props: EntityKubernetesContentProps,
) => JSX.Element = kubernetesPlugin.provide(
  createRoutableExtension({
    name: 'EntityKubernetesContent',
    component: () => import('./Router').then(m => m.Router),
    mountPoint: rootCatalogKubernetesRouteRef,
  }),
);
