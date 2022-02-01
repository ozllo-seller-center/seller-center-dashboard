import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField } from '@unform/core';
import { useDropzone } from 'react-dropzone'

import styles from './styles.module.scss';
import { FiCheck, FiX } from 'react-icons/fi';

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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setErr(false)

    try {
      if (dropZoneRef.current) {
        const valid = await onFileUploaded(acceptedFiles[0])

        console.log(valid)

        if (valid) {
          setselectedFile([URL.createObjectURL(acceptedFiles[0])]);
          return
        }

        setErr(true)
      }
    } catch (err) {
      console.log(err)
      setErr(true)
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

        if (value)
          setselectedFile([URL.createObjectURL(value[0])]);
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
        <input {...getInputProps()} accept='text/xml' ref={dropZoneRef} />
        {
          !!error || err ?
            <>
              <p>
                Erro com o arquivon selecionado
                <br />
                Certifique-se que o arquivo é um XML válido
              </p>
            </>
            :
            selectedFile.length >= 1
              ?
              <>
                <FiCheck />
                <p>
                  XML da NFe carregado
                </p>
              </>
              :
              isDragActive ?
                <p>
                  Solte o arquivo XML aqui ...
                </p>
                :
                <p>
                  Clique ou arraste o
                  <br />
                  XML da NFe aqui
                </p>
        }
      </div>
    </div>
  )
}

export default NfeDropzone;
