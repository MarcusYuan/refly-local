import React, { useState, useCallback, useMemo } from 'react';
import { Button, Dropdown, MenuProps, Popconfirm, DropdownProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { IconDelete, IconMoreHorizontal, IconEdit } from '@refly-packages/ai-workspace-common/components/common/icon';
import { useDeleteCanvas } from '@refly-packages/ai-workspace-common/hooks/canvas/use-delete-canvas';
import { CanvasRename } from './canvas-rename';
import { useUpdateCanvas } from '@refly-packages/ai-workspace-common/queries';
import { useSiderStoreShallow } from '@refly-packages/ai-workspace-common/stores/sider';

interface ActionDropdownProps {
  canvasId: string;
  canvasTitle?: string;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({ canvasId, canvasTitle }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const { deleteCanvas } = useDeleteCanvas();
  const { mutate: updateCanvas } = useUpdateCanvas();
  const { updateCanvasTitle } = useSiderStoreShallow((state) => ({
    updateCanvasTitle: state.updateCanvasTitle,
  }));

  const handleDelete = async () => {
    await deleteCanvas(canvasId);
    setPopupVisible(false);
  };

  const handleModalOk = (newTitle: string) => {
    if (newTitle?.trim()) {
      updateCanvas({ body: { canvasId, title: newTitle } });
      updateCanvasTitle(canvasId, newTitle);
      setIsModalOpen(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        label: (
          <div
            className="flex items-center"
            onClick={() => {
              setIsModalOpen(true);
              setPopupVisible(false);
            }}
          >
            <IconEdit size={16} className="mr-2" />
            {t('canvas.toolbar.rename')}
          </div>
        ),
        key: 'rename',
      },
      {
        label: (
          <Popconfirm
            title={t('workspace.deleteDropdownMenu.deleteConfirmForCanvas', { canvas: canvasTitle })}
            onConfirm={handleDelete}
            onCancel={() => setPopupVisible(false)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
          >
            <div className="flex items-center text-red-600">
              <IconDelete size={16} className="mr-2" />
              {t('workspace.deleteDropdownMenu.delete')}
            </div>
          </Popconfirm>
        ),
        key: 'delete',
      },
    ],
    [handleDelete, canvasTitle],
  );

  const handleOpenChange = useCallback<DropdownProps['onOpenChange']>((open: boolean, info: any) => {
    if (info.source === 'trigger') {
      setPopupVisible(open);
    }
  }, []);

  return (
    <>
      <Dropdown
        trigger={['click']}
        open={popupVisible}
        onOpenChange={handleOpenChange}
        destroyPopupOnHide
        menu={{ items }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center h-9 bg-[#ffffff] rounded-lg px-2 border border-solid border-1 border-[#EAECF0] box-shadow-[0px_2px_6px_0px_rgba(0,0,0,0.1)]">
            <Button type="text" icon={<IconMoreHorizontal />} className="w-8 h-6 flex items-center justify-center" />
          </div>
        </div>
      </Dropdown>

      <CanvasRename
        canvasTitle={canvasTitle}
        isModalOpen={isModalOpen}
        handleModalOk={handleModalOk}
        handleModalCancel={handleModalCancel}
      />
    </>
  );
};
