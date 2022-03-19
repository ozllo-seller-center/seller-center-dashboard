import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useField } from '@unform/core';
import { useDropzone } from 'react-dropzone';

import { FiCheck, FiX } from 'react-icons/fi';
import styles from './styles.module.scss';

interface Props {
  name: string;
  onFileUploaded: (f: File) => Promise<boolean>;
}

interface InputRefProps extends HTMLInputElement {
  acceptedFiles: File[];
}

const NfeDropzone: React.FC<Props> = ({ name, onFileUploaded }) => {
  const [selectedFile, setselectedFile] = useState<string[]>([]);
  const [err, setErr] = useState(false);

  const dropZoneRef = useRef<InputRefProps>(null);

  const { fieldName, registerField, defaultValue = [], error } = useField(name);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErr(false);

      try {
        if (dropZoneRef.current) {
          const valid = await onFileUploaded(acceptedFiles[0]);

          if (valid) {
            setselectedFile([URL.createObjectURL(acceptedFiles[0])]);
            return;
          }

          setErr(true);
        }
      } catch (er) {
        console.log(er);
        setErr(true);
      }
    },
    [selectedFile, onFileUploaded],
  );

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

        if (value) {
          setselectedFile([URL.createObjectURL(value[0])]);
        }
      },
    });
  }, [fieldName, registerField]);

  const containerStyles = useMemo(() => {
    if (error) {
      return styles.error;
    }

    if (selectedFile.length >= 1) {
      return styles.uploaded;
    }

    return styles.importzone;
  }, [error, selectedFile.length]);

  return (
    <div className={styles.parent}>
      {selectedFile.length >= 1 && (
        <FiX
          onClick={() => {
            if (dropZoneRef.current) {
              dropZoneRef.current.acceptedFiles = [];
            }

            setselectedFile([]);
          }}
        />
      )}
      <div
        className={containerStyles}
        {...getRootProps()}
        onClick={() => dropZoneRef.current?.click()}
      >
        <input {...getInputProps()} accept="text/xml" ref={dropZoneRef} />
        {(!!error || err) && (
          <p>
            Erro com o arquivon selecionado
            <br />
            Certifique-se que o arquivo é um XML válido
          </p>
        )}
        {selectedFile.length >= 1 && (
          <>
            <FiCheck />
            <p>XML da NFe carregado</p>
          </>
        )}
        {isDragActive && <p>Solte o arquivo XML aqui ...</p>}
        {!isDragActive && selectedFile.length <= 0 && !error && !err && (
          <p>
            Clique ou arraste o
            <br />
            XML da NFe aqui
          </p>
        )}
      </div>
    </div>
  );
};

export default NfeDropzone;
