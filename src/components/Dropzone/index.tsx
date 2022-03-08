import { useField } from '@unform/core';
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { useDropzone } from 'react-dropzone';
import { FiCamera, FiAlertCircle } from 'react-icons/fi';

// import './styles.module.css';

interface Props {
  name: string;
  onFileUploaded: (acceptedFiles: File[], dropZoneRef: React.RefObject<any>) => void;
  disabled?: boolean;
}

interface InputRefProps extends HTMLInputElement {
  acceptedFiles: string[];
}

// TODO: Passar a lista de imagens para dentro deste componente (externalizar como outro componente se preicsar)
const Dropzone: React.FC<Props> = ({ name, onFileUploaded, disabled }) => {
  // const [selectedFileUrl, setselectedFileUrl] = useState<string[]>([]);
  const [err, setErr] = useState<string>();

  const dropZoneRef = useRef<InputRefProps>(null);
  const {
    fieldName, registerField, defaultValue, error, clearError,
  } = useField(name);

  const onDrop = useCallback((acceptedFiles) => {
    setErr(undefined);
    clearError();

    // if (disabled && dropZoneRef.current) {
    //   const popped = acceptedFiles.pop()

    //   dropZoneRef.current.acceptedFiles = popped
    //   return
    // }

    try {
      if (dropZoneRef.current) {
        // const file = acceptedFiles[0];
        onFileUploaded(acceptedFiles, dropZoneRef);
      }
    } catch (er: any) {
      console.log(er);

      setErr(er as string);
      setTimeout(() => {
        setErr(undefined);
      }, 3000);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: dropZoneRef.current,
      getValue: (ref: InputRefProps) => ref.acceptedFiles,
      clearValue: (ref: InputRefProps) => {
        ref.acceptedFiles = [];
        // setFilesUrl([]);
      },
      setValue: (ref: InputRefProps, value) => {
        ref.acceptedFiles = value;
        // setFilesUrl(defaultValue);
      },
    });
  }, [fieldName, registerField]);

  return (
    <div className="dropzone" {...getRootProps()} onClick={() => dropZoneRef.current?.click()}>
      <input {...getInputProps()} accept="image/*" ref={dropZoneRef} />
      {(error && !isDragActive) && (
      <p className="error">
        <FiAlertCircle />
        {error}
      </p>
      )}
      {(err && !isDragActive) && (
      <p className="error">
        <FiAlertCircle />
        Erro com o arquivo selecionado
        <br />
        Tente novamente
      </p>
      )}
      {isDragActive && (
      <p>
        <FiCamera />
        Solte o arquivo aqui ...
      </p>
      )}
      {(!isDragActive && !err && !error) && (
      <p>
        <FiCamera />
        Clique ou arraste
        <br />
        As fotos aqui
      </p>
      )}
    </div>
  );
};

export default Dropzone;
