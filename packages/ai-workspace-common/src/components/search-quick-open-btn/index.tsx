import { useQuickSearchStateStore } from '@refly-packages/ai-workspace-common/stores/quick-search-state';
import { reflyEnv } from '@refly-packages/ai-workspace-common/utils/env';

import './index.scss';
import { useTranslation } from 'react-i18next';
import { bigSearchQuickOpenEmitter } from '@refly-packages/ai-workspace-common/utils/event-emitter/big-search-quick-open';
import classNames from 'classnames';
import { IconPlus, IconSearch } from '@arco-design/web-react/icon';

interface SearchQuickOpenBtnProps extends React.ComponentProps<'div'> {
  placeholder?: string;
  collapse?: boolean;
}
export const SearchQuickOpenBtn = (props: SearchQuickOpenBtnProps) => {
  const { placeholder, collapse, ...divProps } = props;

  const { t } = useTranslation();

  return (
    <div {...divProps} className={classNames('search-quick-open-container', divProps.className)}>
      {collapse ? (
        <div
          className="flex justify-center items-center quick-search-btn-collapse"
          onClick={() => {
            bigSearchQuickOpenEmitter.emit('openSearch');
          }}
        >
          <IconSearch style={{ fontSize: 20 }} />
        </div>
      ) : (
        <div
          className="search-quick-open-input"
          onClick={() => {
            bigSearchQuickOpenEmitter.emit('openSearch');
          }}
        >
          <div className="search-quick-open-text">
            <IconSearch />
            <span
              style={{
                marginLeft: 8,
              }}
            >
              {t(`${placeholder || 'loggedHomePage.searchEverything'}`)}
            </span>
          </div>
          <div className="search-quick-open-shortcuts">
            <div className="search-quick-open-shortcut-key">{reflyEnv.getOsType() === 'OSX' ? '⌘' : 'ctrl'}</div>
            <div className="search-quick-open-shortcut-key search-quick-open-shortcut-key__right">K</div>
          </div>
        </div>
      )}
    </div>
  );
};
