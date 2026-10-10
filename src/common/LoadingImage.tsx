import styles from "./LoadingImage.module.css";
import { clsx as cn } from "clsx";
import {
  useEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from "react";

type LoadingImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "loading"
> & {
  loading?: "eager" | "lazy";
  presentation?:
    | "default"
    | "problem-preview"
    | "diagram-preview"
    | "print"
    | "problem";
};

export function LoadingImage({
  className = "",
  presentation = "default",
  decoding = "async",
  loading = "lazy",
  onError,
  onLoad,
  src,
  ...props
}: LoadingImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [settledSource, setSettledSource] = useState<string | undefined>();
  const settled = Boolean(src && settledSource === src);

  useEffect(() => {
    if (imageRef.current?.complete) setSettledSource(src);
  }, [src]);

  const finishLoading = (event: SyntheticEvent<HTMLImageElement>) => {
    setSettledSource(src);
    onLoad?.(event);
  };

  const finishWithError = (event: SyntheticEvent<HTMLImageElement>) => {
    setSettledSource(src);
    onError?.(event);
  };

  return (
    <img
      {...props}
      ref={imageRef}
      src={src}
      loading={loading}
      decoding={decoding}
      aria-busy={settled ? undefined : true}
      data-loading-image={settled ? "loaded" : "loading"}
      className={cn(
        styles.image,
        settled ? styles.settled : styles.loading,
        presentation !== "default" && styles[presentation],
        className,
      )}
      onLoad={finishLoading}
      onError={finishWithError}
    />
  );
}
