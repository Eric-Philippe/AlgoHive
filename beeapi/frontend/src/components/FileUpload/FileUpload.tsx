import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import {
  FileUpload,
  FileUploadHandlerEvent,
  FileUploadHeaderTemplateOptions,
  FileUploadSelectEvent,
  FileUploadUploadEvent,
  ItemTemplateOptions,
} from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import "./FileUpload.css";

interface FileUploadProps {
  theme: string;
  setRefresh: (value: boolean) => void;
}

export default function FileUploadComponent({
  theme,
  setRefresh,
}: FileUploadProps) {
  const toast = useRef<Toast>(null);
  const [totalSize, setTotalSize] = useState(0);
  const fileUploadRef = useRef<FileUpload>(null);

  const onTemplateSelect = (e: FileUploadSelectEvent) => {
    const validFiles = e.files.filter((file) => file.name.endsWith(".alghive"));

    if (validFiles.length !== e.files.length) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Only .alghive files are allowed",
      });
    }

    let _totalSize = totalSize;

    for (let i = 0; i < validFiles.length; i++) {
      _totalSize += validFiles[i].size || 0;
    }

    setTotalSize(_totalSize);
  };

  const onTemplateUpload = (e: FileUploadUploadEvent) => {
    let _totalSize = 0;

    e.files.forEach((file) => {
      _totalSize += file.size || 0;
    });

    setTotalSize(_totalSize);
    toast.current?.show({
      severity: "info",
      summary: "Success",
      detail: "File Uploaded",
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const onTemplateRemove = (file: File, func: Function) => {
    setTotalSize(totalSize - file.size);
    func();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  const customProxyReadyUploader = async (event: FileUploadHandlerEvent) => {
    const formData = new FormData();
    // Push files to form data
    event.files.forEach((file) => {
      formData.append("files", file, file.name);
    });

    const errors = [];

    try {
      const responses = await Promise.all(
        event.files.map((file) => {
          if (!file.name.endsWith(".alghive")) {
            return Promise.resolve(new Response(null, { status: 400 }));
          }
          const fileFormData = new FormData();
          fileFormData.append("file", file, file.name);
          return fetch(`/puzzle/upload?theme=${theme}`, {
            method: "POST",
            body: fileFormData,
          });
        })
      );

      const allSuccessful = responses.every((response) => response.ok);

      fetch("/theme/reload", {
        method: "POST",
      }).then((res) => {
        if (res.ok) {
          setRefresh(true);
          // Remove the uploaded files from the file upload component
          fileUploadRef.current?.clear();
        }
      });

      if (allSuccessful) {
        toast.current?.show({
          severity: "info",
          summary: "Success",
          detail: "All Files Uploaded",
        });
      } else {
        // Get the error messages from the responses
        const errorMessages = await Promise.all(
          responses.map(async (response) => {
            if (!response.ok) {
              return await response.text();
            }

            return "";
          })
        );

        errors.push(
          ...errorMessages.map((message) => message || "Unknown Error")
        );

        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: `File Upload Failed: ${errors.join(", ")}`,
          sticky: true,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "File Upload Failed",
      });
      console.error(error);
    }
  };

  const headerTemplate = (options: FileUploadHeaderTemplateOptions) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / 10000;
    const formatedValue =
      fileUploadRef && fileUploadRef.current
        ? fileUploadRef.current.formatSize(totalSize)
        : "0 B";

    return (
      <div
        className={className}
        style={{
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
        }}
      >
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formatedValue} / 1 MB</span>
          <ProgressBar
            value={value}
            showValue={false}
            style={{ width: "10rem", height: "12px" }}
          ></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (inFile: object, props: ItemTemplateOptions) => {
    const file = inFile as File;
    return (
      <div className="flex align-items-center flex-wrap item-template">
        <i
          className="pi pi-folder"
          style={{ fontSize: "2em", marginRight: "1rem" }}
        ></i>
        <div className="text-left file-details">
          <span>{file.name}</span>
          <small>{new Date().toLocaleDateString()}</small>
        </div>

        <Tag
          value={props.formatSize}
          severity="warning"
          className="px-3 py-2 mr-6"
        />
        <Button
          type="button"
          icon="pi pi-times"
          className="p-button-outlined p-button-rounded p-button-danger ml-auto"
          onClick={() => onTemplateRemove(file, props.onRemove)}
        />
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column empty-template">
        <i
          className="pi pi-folder mt-3 p-5"
          style={{
            fontSize: "5em",
            borderRadius: "50%",
            backgroundColor: "var(--surface-b)",
            color: "var(--surface-d)",
          }}
        ></i>
        <span
          style={{ fontSize: "1.2em", color: "var(--text-color-secondary)" }}
          className="my-5"
        >
          Drag and Drop AlgHive files to here to upload
        </span>
      </div>
    );
  };

  const chooseOptions = {
    icon: "pi pi-fw pi-folder",
    iconOnly: true,
    className: "custom-choose-btn p-button-rounded p-button-outlined",
  };
  const uploadOptions = {
    icon: "pi pi-fw pi-cloud-upload",
    iconOnly: true,
    className:
      "custom-upload-btn p-button-success p-button-rounded p-button-outlined",
  };
  const cancelOptions = {
    icon: "pi pi-fw pi-times",
    iconOnly: true,
    className:
      "custom-cancel-btn p-button-danger p-button-rounded p-button-outlined",
  };

  return (
    <div>
      <Toast ref={toast}></Toast>

      <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
      <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
      <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

      <FileUpload
        ref={fileUploadRef}
        name="demo[]"
        multiple
        accept=".alghive"
        maxFileSize={1000000}
        onUpload={onTemplateUpload}
        onSelect={onTemplateSelect}
        onError={onTemplateClear}
        onClear={onTemplateClear}
        headerTemplate={headerTemplate}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
        customUpload
        uploadHandler={customProxyReadyUploader}
      />
    </div>
  );
}
