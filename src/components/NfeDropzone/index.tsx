import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField } from '@unform/core';
import { useDropzone } from 'react-dropzone'

import styles from './styles.module.scss';
import { FiCheck, FiX } from 'react-icons/fi';

interface Props {
  name: string;
  onFileUploaded: Function;
}

interface InputRefProps extends HTMLInputElement {
  acceptedFiles: File[];
}

const NfeDropzone: React.FC<Props> = ({ name, onFileUploaded }) => {
  const [selectedFile, setselectedFile] = useState<string[]>([]);
  // const [err, setErr] = useState(false);

  const dropZoneRef = useRef<InputRefProps>(null);

  const { fieldName, registerField, defaultValue = [], error } = useField(name);

  const onDrop = useCallback(acceptedFiles => {
    try {
      if (dropZoneRef.current) {
        onFileUploaded(acceptedFiles);
        setselectedFile(acceptedFiles.map((f: File) => URL.createObjectURL(f)));
      }
    } catch (err) {

    }
  }, [selectedFile, onFileUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  })

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: dropZoneRef.current,
      getValue: (ref: InputRefProps) => {
        return ref.acceptedFiles || [];
      },
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

  return (
    <div className={styles.parent}>
      {selectedFile.length >= 1 &&
        <FiX onClick={() => {
          if (!!dropZoneRef.current)
            dropZoneRef.current.acceptedFiles = []

          setselectedFile([])
        }} />
      }
      <div
        className={!!error ? styles.error : selectedFile.length >= 1 ? styles.uploaded : styles.importzone}
        {...getRootProps()}
        onClick={() => dropZoneRef.current?.click()}
      >
        <input {...getInputProps()} ref={dropZoneRef} />
        {
          !!error ?
            <>
              <p>
                Erro com o(s) arquivo(s) selecionado(s)
                <br />
                Tente novamente
              </p>
            </>
            :
            selectedFile.length >= 1
              ?
              <>
                <FiCheck />
                <p>
                  {selectedFile.length > 1 ? 'Arquivos carregados' : 'Arquivo carregado'}
                </p>
              </>
              :
              isDragActive ?
                <p>
                  Solte o arquivo aqui ...
                </p>
                :
                <p>
                  Clique ou arraste o(s)
                  <br />
                  arquivos aqui
                </p>
        }
      </div>
    </div>
  )
}

export default NfeDropzone;
