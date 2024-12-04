import { useTranslation } from 'react-i18next';

import { DocumentList } from '../document-list';
import { ResourceList } from '../resource-list';

import { Modal, Tabs } from 'antd';
import './index.scss';
import { IconDocument, IconLibrary, IconResource } from '@refly-packages/ai-workspace-common/components/common/icon';

interface LibraryModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const LibraryModal = (props: LibraryModalProps) => {
  const { visible, setVisible } = props;
  const { t } = useTranslation();
  const tabs = [
    {
      key: 'document',
      label: t('common.document'),
      icon: <IconDocument style={{ transform: 'translateY(2px)' }} />,
      children: <DocumentList />,
    },
    {
      key: 'resource',
      label: t('common.resource'),
      icon: <IconResource style={{ transform: 'translateY(2px)' }} />,
      children: <ResourceList />,
    },
  ];

  return (
    <Modal
      className="library-modal"
      centered
      title={
        <span className="flex items-center gap-2 text-lg font-medium">
          <IconLibrary /> {t('common.library')}
        </span>
      }
      width={1000}
      footer={null}
      open={visible}
      onCancel={() => setVisible(false)}
      focusTriggerAfterClose={false}
    >
      <Tabs items={tabs} />
    </Modal>
  );
};
