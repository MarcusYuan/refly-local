import { Markdown } from '@refly-packages/ai-workspace-common/components/markdown';
import { HiOutlineLightBulb } from 'react-icons/hi2';
import { AiOutlineCodepen } from 'react-icons/ai';

// 自定义样式
import './index.scss';
import { useSearchParams } from '@refly-packages/ai-workspace-common/utils/router';
import { Skeleton, Message as message, Empty, Affix } from '@arco-design/web-react';
import {
  type KnowledgeBaseTab,
  useKnowledgeBaseStore,
} from '@refly-packages/ai-workspace-common/stores/knowledge-base';
// 请求
import getClient from '@refly-packages/ai-workspace-common/requests/proxiedRequest';
// 类型
import { Resource } from '@refly/openapi-schema';
import { memo, useEffect, useState } from 'react';
import { safeParseURL } from '@refly/utils/url';
import { useKnowledgeBaseTabs } from '@refly-packages/ai-workspace-common/hooks/use-knowledge-base-tabs';
import { LabelGroup } from '@refly-packages/ai-workspace-common/components/knowledge-base/label-group';
import { useReloadListState } from '@refly-packages/ai-workspace-common/stores/reload-list-state';

// content selector
import { useContentSelector } from '@refly-packages/ai-workspace-common/modules/content-selector/hooks/use-content-selector';
import '@refly-packages/ai-workspace-common/modules/content-selector/styles/content-selector.scss';
import classNames from 'classnames';
import { useContentSelectorStore } from '@refly-packages/ai-workspace-common/modules/content-selector/stores/content-selector';
import ResourceCollectionList from '@refly-packages/ai-workspace-common/components/knowledge-base/resource-detail/resource-collection-list';
import { useTranslation } from 'react-i18next';

export const KnowledgeBaseResourceDetail = memo(() => {
  const { t } = useTranslation();
  const [isFetching, setIsFetching] = useState(false);
  const knowledgeBaseStore = useKnowledgeBaseStore((state) => ({
    currentResource: state.currentResource,
    updateResource: state.updateResource,
    resetTabs: state.resetTabs,
  }));
  const { handleAddTab } = useKnowledgeBaseTabs();
  // 初始块选择
  const { showContentSelector, scope } = useContentSelectorStore((state) => ({
    showContentSelector: state.showContentSelector,
    scope: state.scope,
  }));
  const { initMessageListener, initContentSelectorElem } = useContentSelector(
    'knowledge-base-resource-content',
    'resourceSelection',
  );

  const [queryParams] = useSearchParams();
  const resId = queryParams.get('resId');
  const kbId = queryParams.get('kbId');
  const reloadKnowledgeBaseState = useReloadListState();

  const resourceDetail = knowledgeBaseStore?.currentResource as Resource;

  const handleGetDetail = async (resourceId: string) => {
    setIsFetching(true);
    try {
      const { data: newRes, error } = await getClient().getResourceDetail({
        query: {
          resourceId,
        },
      });

      if (error) {
        throw error;
      }
      if (!newRes?.success) {
        throw new Error(newRes?.errMsg);
      }

      console.log('newRes', newRes);
      const resource = newRes?.data as Resource;
      knowledgeBaseStore.updateResource(resource);

      setTimeout(() => {
        // 添加新 Tab
        const newTab: KnowledgeBaseTab = {
          title: resource?.title || '',
          key: resource?.resourceId || '',
          content: resource?.contentPreview || '',
          resourceId: resource?.resourceId || '',
        };
        handleAddTab(newTab);
      });
    } catch (err) {
      message.error('获取内容详情失败，请重新刷新试试');
    }

    setIsFetching(false);
  };

  const handleUpdateCollections = (collectionId: string) => {
    if (resId) {
      handleGetDetail(resId as string);
    }
    if (collectionId === kbId) {
      reloadKnowledgeBaseState.setReloadKnowledgeBaseList(true);
    }
  };

  useEffect(() => {
    if (resId && reloadKnowledgeBaseState.reloadResourceDetail) {
      handleGetDetail(resId as string);
    }
    reloadKnowledgeBaseState.setReloadResourceDetail(false);
  }, [reloadKnowledgeBaseState.reloadResourceDetail]);

  useEffect(() => {
    if (resId) {
      console.log('params resId', resId);
      handleGetDetail(resId as string);
    }
  }, [resId]);

  useEffect(() => {
    if (kbId && !resId) {
      knowledgeBaseStore.resetTabs();
    }
  }, [kbId]);

  // 初始化块选择
  useEffect(() => {
    const remove = initMessageListener();

    return () => {
      remove();
    };
  }, [resId]);

  return (
    <div className="knowledge-base-resource-detail-container">
      {resId ? (
        <div className="knowledge-base-resource-detail-body">
          {isFetching ? (
            <div style={{ margin: '20px auto' }}>
              <Skeleton animation style={{ marginTop: 24 }}></Skeleton>
            </div>
          ) : (
            <div className="knowledge-base-resource-meta">
              <Affix offsetTop={48.1}>
                <ResourceCollectionList
                  collections={resourceDetail?.collections}
                  updateCallback={(collectionId) => handleUpdateCollections(collectionId)}
                />
              </Affix>
              <div className="knowledge-base-directory-site-intro">
                <div className="site-intro-icon">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${safeParseURL(resourceDetail?.data?.url as string)}&sz=${32}`}
                    alt={resourceDetail?.data?.url}
                  />
                </div>
                <div className="site-intro-content">
                  <p className="site-intro-site-name">{resourceDetail?.data?.title}</p>
                  <a className="site-intro-site-url" href={resourceDetail?.data?.url} target="_blank">
                    {resourceDetail?.data?.url}
                  </a>
                </div>
              </div>
              {/* <div className="knowledge-base-directory-action">
                <div className="action-summary">
                  <HiOutlineLightBulb />
                  <span className="action-summary-text">AI Summary</span>
                </div>

                <div className="action-summary">
                  <AiOutlineCodepen />
                  <span className="action-summary-text">知识图谱</span>
                </div>
              </div> */}
              {resourceDetail && <LabelGroup entityId={resourceDetail.resourceId} entityType={'resource'} />}
            </div>
          )}
          {isFetching ? (
            <div style={{ margin: '20px auto' }}>
              <Skeleton animation style={{ marginTop: 24 }}></Skeleton>
              <Skeleton animation style={{ marginTop: 24 }}></Skeleton>
              <Skeleton animation style={{ marginTop: 24 }}></Skeleton>
            </div>
          ) : (
            <div
              className={classNames('knowledge-base-resource-content', {
                'refly-selector-mode-active': showContentSelector,
                'refly-block-selector-mode': scope === 'block',
                'refly-inline-selector-mode': scope === 'inline',
              })}
            >
              {initContentSelectorElem()}
              <div className="knowledge-base-resource-content-title">{resourceDetail?.title}</div>
              <Markdown content={resourceDetail?.content || ''}></Markdown>
            </div>
          )}
        </div>
      ) : (
        <div className="knowledge-base-resource-detail-empty">
          <Empty description={t('common.empty')} />
        </div>
      )}
    </div>
  );
});
