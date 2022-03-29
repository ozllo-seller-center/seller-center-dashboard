import React, { useCallback, useEffect, useState } from 'react';

import { ProductImage } from 'src/shared/types/product';

import Dropzone from '../Dropzone';
import ImageCard from '../ImageCard';

import styles from './styles.module.scss';

interface ImageControllerProps {
  files: ProductImage[];
  handleFileOrder: (draggedFile: number, droppedAt: number) => void;
  handleOnFileUpload: (
    acceptedFiles: File[],
    dropZoneRef: React.RefObject<any>,
  ) => void;
  handleDeleteFile?: (url: string) => void;
}

const ImageController: React.FC<ImageControllerProps> = ({
  files,
  handleFileOrder,
  handleOnFileUpload,
  handleDeleteFile,
  ...rest
}) => {
  const [dragging, setDraggin] = useState(-1);

  const [dropPos, setDropPos] = useState(-1);
  const [dropIntent, setDropIntent] = useState<boolean>(false);

  const dragParentHandler = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (dragging >= 0) {
        const x = e.clientX;

        let children = [...e.currentTarget.children];
        children = children.filter((item, i) => i > 0 && item.id !== 'divider');

        children.map((item, i) => {
          if (i === dragging) {
            return;
          }

          const { left } = item.getBoundingClientRect();

          if (x >= left && x >= left + item.clientWidth * 0.5 && dragging < i) {
            setDropIntent(true);
            setDropPos(i);
          }

          if (x >= left && x <= left + item.clientWidth * 0.5 && dragging > i) {
            setDropIntent(false);
            setDropPos(i > 0 ? i : 0);
          }
        });
      }
    },
    [dragging],
  );

  const dropHandler = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      if (dragging === dropPos) {
        return;
      }

      handleFileOrder(dragging, dropPos);

      setDraggin(-1);
      setDropPos(-1);
    },
    [dragging, dropPos, handleFileOrder],
  );

  return (
    <div
      className={styles.imagesContainer}
      onDrag={e => dragParentHandler(e)}
      onDrop={e => dropHandler(e)}
    >
      <Dropzone
        name="images"
        onFileUploaded={handleOnFileUpload}
        disabled={!!dragging}
      />

      {files.map((f, i) => {
        if (f.url) {
          return (
            <div key={i} style={{ display: 'flex' }}>
              {dropPos === i && !dropIntent && (
                <hr
                  key="previous"
                  id="divider"
                  className={styles.dragLeftDivider}
                />
              )}
              <ImageCard
                onClick={() =>
                  handleDeleteFile ? handleDeleteFile(f.url as string) : {}
                }
                imgUrl={f.url}
                onDrag={() => setDraggin(i)}
                style={
                  dragging === i
                    ? { opacity: 0.5, transform: 'scale(0.7)' }
                    : {}
                }
                showOnly={dragging === i}
              />
              {dropPos === i && dropIntent && (
                <hr id="divider" className={styles.dragRightDivider} />
              )}
            </div>
          );
        }
      })}
    </div>
  );
};

export default ImageController;
