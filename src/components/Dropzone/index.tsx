import { useField } from '@unform/core';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiCamera, FiAlertCircle } from 'react-icons/fi'
import { getFilename } from 'src/utils/util';

// import './styles.module.css';

interface Props {
  name: string;
  onFileUploaded: (file: string[]) => void;
  filesUrl: string[];
  setFilesUrl: React.Dispatch<React.SetStateAction<string[]>>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

interface InputRefProps extends HTMLInputElement {
  acceptedFiles: string[];
}

// TODO: Passar a lista de imagens para dentro deste componente (externalizar como outro componente se preicsar)
const Dropzone: React.FC<Props> = ({ name, onFileUploaded, filesUrl, setFilesUrl, files, setFiles }) => {
  // const [selectedFileUrl, setselectedFileUrl] = useState<string[]>([]);
  const [err, setErr] = useState();

  const dropZoneRef = useRef<InputRefProps>(null);
  const { fieldName, registerField, defaultValue = [], error } = useField(name);

  const onDrop = useCallback(acceptedFiles => {
    setErr(undefined);
    try {
      if (dropZoneRef.current) {
        // const file = acceptedFiles[0];

        // if (!filesUrl.includes(file)) {
        setFiles([...files, ...acceptedFiles]);
        let f = acceptedFiles.map((file: File) => URL.createObjectURL(file))

        dropZoneRef.current.acceptedFiles = [...filesUrl, ...f];
        setFilesUrl([...filesUrl, ...f]);
        onFileUploaded(f);
        // }
      }

    } catch (err) {
      setErr(err);
      setTimeout(() => {
        setErr(undefined);
      }, 3000);
    }
  }, [files, filesUrl, onFileUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
  })

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: dropZoneRef.current,
      getValue: (ref: InputRefProps) => {
        return ref.acceptedFiles;
      },
      clearValue: (ref: InputRefProps) => {
        ref.acceptedFiles = [];
        setFilesUrl([]);
      },
      setValue: (ref: InputRefProps, value) => {
        ref.acceptedFiles = value;
        value.forEach(async (url) => {
          await fetch(url).then(r => r.blob()).then(blobFile => new File([blobFile], getFilename(url), { type: "image/png/jpg/jpeg" })).then(f => {
            setFiles([...files, f])
          });
        })

        setFilesUrl(value);
      },
    });
  }, [fieldName, registerField]);

  return (
    <div className='dropzone' {...getRootProps()} onClick={() => dropZoneRef.current?.click()}>
      <input {...getInputProps()} accept='image/*' ref={dropZoneRef} />
      {
        // selectedFileUrl
        //   ?
        //   <img src={selectedFileUrl} alt='Point thumbnail' />
        //   :
        !!error ?
          <p className='error'>
            <FiAlertCircle />
            {error}
          </p>
          :
          !!err ?
            <p className='error'>
              <FiAlertCircle />
              Erro com o arquivo selecionado
              <br />
              Tente novamente
            </p>
            :
            isDragActive ?
              <p>
                <FiCamera />
                Solte o arquivo aqui ...
              </p>
              :
              <p>
                <FiCamera />
                Clique ou arraste
                <br />
                As fotos aqui
              </p>
      }
    </div>
  )
}

export default Dropzone;
