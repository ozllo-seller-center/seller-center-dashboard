import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useField } from '@unform/core';
import { useDropzone } from 'react-dropzone';

import { FiCheck, FiX } from 'react-icons/fi';
import styles from './styles.module.scss';

interface Props {
  name: string;
  onFileUploaded: Function;
}

interface InputRefProps extends HTMLInputElement {
  acceptedFiles: File[];
}

const Importzone: React.FC<Props> = ({ name, onFileUploaded }) => {
  const [selectedFile, setselectedFile] = useState<string[]>([]);
  // const [err, setErr] = useState(false);

  const dropZoneRef = useRef<InputRefProps>(null);

  const {
    fieldName, registerField, defaultValue = [], error,
  } = useField(name);

  const onDrop = useCallback((acceptedFiles) => {
    try {
      if (dropZoneRef.current) {
        onFileUploaded(acceptedFiles);
        setselectedFile(acceptedFiles.map((f: File) => URL.createObjectURL(f)));
      }
    } catch (err) {
      console.log(err);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: dropZoneRef.current,
      getValue: (ref: InputRefProps) => ref.acceptedFiles || [],
      clearValue: (ref: InputRefProps) => {
        ref.acceptedFiles = [];
        setselectedFile([]);
      },
      setValue: (ref: InputRefProps, value) => {
        ref.acceptedFiles = value;
        setselectedFile(value.map((f: File) => URL.createObjectURL(f)));
      },
    });
  }, [fieldName, registerField]);

  const containerStyle = useMemo(() => {
    if (error) { return styles.error; }

    if (selectedFile.length >= 1) { return styles.uploaded; }

    return styles.importzone;
  }, [error, selectedFile]);

  return (
    <div className={styles.parent}>
      {selectedFile.length >= 1
        && (
        <FiX onClick={() => {
          if (dropZoneRef.current) { dropZoneRef.current.acceptedFiles = []; }

          setselectedFile([]);
        }}
        />
        )}
      <div
        className={containerStyle}
        {...getRootProps()}
        onClick={() => dropZoneRef.current?.click()}
      >
        <input {...getInputProps()} ref={dropZoneRef} />
        {(error && !isDragActive) && (
        <p>
          Erro com o(s) arquivo(s) selecionado(s)
          <br />
          Tente novamente
        </p>
        )}
        {selectedFile.length >= 1 && (
          <>
            <FiCheck />
            <p>
              {selectedFile.length > 1 ? 'Arquivos carregados' : 'Arquivo carregado'}
            </p>
          </>
        )}
        {isDragActive && (
        <p>
          Solte o arquivo aqui ...
        </p>
        )}
        {(!isDragActive && !error && selectedFile.length <= 0) && (
        <p>
          Clique ou arraste o(s)
          <br />
          arquivos aqui
        </p>
        )}
      </div>
    </div>
  );
};

export default Importzone;
