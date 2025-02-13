"use client";
import { useGridtems, useMap } from "@/lib/context";
import { Item } from "@/lib/types";
import { Image, Link2, Type } from "lucide-react";
import React, { memo } from "react";
import { v4 as uuid } from "uuid";
import urlMetadata, { Options } from "url-metadata";
import toast from "react-hot-toast";
import axios from "axios";

const uoptions = {
  // custom request headers
  requestHeaders: {
    "User-Agent": "url-metadata/3.0 (npm module)",
    From: "example@example.com",
  },

  // `fetch` API cache setting for request
  cache: "no-cache",

  // `fetch` API mode (ex: 'cors', 'no-cors', 'same-origin', etc)
  mode: "cors",

  // charset to decode response with (ex: 'auto', 'utf-8', 'EUC-JP')
  // defaults to auto-detect in `Content-Type` header or meta tag
  // if none found, default `auto` option falls back to `utf-8`
  // override by passing in charset here (ex: 'windows-1251'):
  decode: "auto",

  // timeout in milliseconds, default is 10 seconds
  timeout: 10000,

  // number of characters to truncate description to
  descriptionLength: 750,

  // force image urls in selected tags to use https,
  // valid for images & favicons with full paths
  ensureSecureImageRequest: true,

  // return raw response body as string
  includeResponseBody: false,

  // alternate use-case: pass in `Response` object here to be parsed
  // see example below
  parseResponseObject: null,
};

const Dock = () => {
  const { items, setItems } = useGridtems();
  const { clear, get, has, map, remove, set } = useMap();
  const options = [
    {
      id: "link",
      name: "Link",
      icon: <Link2 className="-rotate-45" />,
      onClick: async () => {
        try {
          const p = prompt("Enter the URL");
          if (!p) return;
          const response = await axios.get(`/api/url`, {
            params: {
              url: p,
            },
          });
          const data = response.data;
          console.log({ data });
          if (response.status !== 200 && data?.error) {
            toast.error(data?.error);
            return;
          }
          const id = uuid();
          const item: Item = {
            i: id,
            h: 2,
            w: 1,
            x: 0,
            y: 0,
            isDraggable: true,
            isResizable: true,
          };
          console.log("adding item", item);
          setItems((prev) => [...prev, item]);
          set(id, { type: "link", url: p, ...data?.metadata });
        } catch (err) {
          console.log(err);
        }
      },
    },
    {
      id: "image",
      name: "Image",
      icon: <Image />,
      onClick: () => {
        const p = prompt("Enter the URL");
        if (!p) return;
        const id = uuid();
        const item: Item = {
          i: id,
          h: 2,
          w: 1,
          x: 0,
          y: 0,
          isDraggable: true,
          isResizable: true,
        };
        console.log("adding item", item);
        setItems((prev) => [...prev, item]);
        set(id, { type: "image", url: p });
      },
    },
    {
      id: "text",
      name: "Text",
      icon: <Type />,
      onClick: () => {
        const p = prompt("Enter the Text");
        if (!p) return;
        const id = uuid();
        const item: Item = {
          i: id,
          h: 2,
          w: 1,
          x: 0,
          y: 0,
          isDraggable: true,
          isResizable: true,
        };
        console.log("adding item", item);
        setItems((prev) => [...prev, item]);
        set(id, { type: "text", text: p });
      },
    },
  ];
  return (
    <div className="max-w-xs w-full rounded-3xl bg-white/90 backdrop-blur-lg shadow-lg px-6 py-2 border border-neutral-300">
      <div className="flex space-x-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={option.onClick}
            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200"
          >
            {option.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default memo(Dock);
