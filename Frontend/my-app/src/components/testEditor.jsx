import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Embed from "@editorjs/embed";
import SimpleImage from "@editorjs/simple-image";
import Checklist from "@editorjs/checklist";
import Quote from "@editorjs/quote";
import Warning from "@editorjs/warning";
import CodeTool from "@editorjs/code";
import Marker from "@editorjs/marker";
import Delimiter from "@editorjs/delimiter";
import InlineCode from "@editorjs/inline-code";
import LinkTool from "@editorjs/link";
import Table from "@editorjs/table";
import Alert from "editorjs-alert";
import Raw from "@editorjs/raw";
import AlignmentTuneTool from "editorjs-text-alignment-blocktune";
import Undo from "editorjs-undo";
import DragDrop from "editorjs-drag-drop";
import NestedList from "@editorjs/nested-list";
import Underline from "@editorjs/underline";
import ColorPlugin from "editorjs-text-color-plugin";
import * as EditorJSInlineStyle from "editorjs-style";
import Paragraph from "@editorjs/paragraph";

function TestEditorLoad() {
  const { id: clubId } = useParams();
  const editorRef = useRef(null);
  const [customizablePage, setCustomizablePage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `http://localhost:5000/clubs/${clubId}/customize`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setCustomizablePage(data);
        } else {
          setCustomizablePage(null);
        }
      } catch (err) {
        console.error("Error fetching customizablePage:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [clubId]);

  useEffect(() => {
    if (loading) return;

    if (editorRef.current) {
      if (typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
      }
      editorRef.current = null;
    }

    const colorsArray = [
      "#FF6900",
      "#FCB900",
      "#7BDCB5",
      "#00D084",
      "#8ED1FC",
      "#0693E3",
      "#ABB8C3",
      "#EB144C",
      "#F78DA7",
      "#9900EF",
    ];

    editorRef.current = new EditorJS({
      holder: "editorjs",
      data:
        customizablePage || {
          time: Date.now(),
          blocks: [
            {
              type: "paragraph",
              data: { text: "No data loaded. Empty editor." },
            },
          ],
        },
      readOnly: true,
      tools: {
        paragraph: { class: Paragraph, inlineToolbar: true, tunes: ["alignmentTuneTool"] },
        header: { class: Header, inlineToolbar: ["link", "marker", "color"], tunes: ["alignmentTuneTool"] },
        list: { class: NestedList, inlineToolbar: true, tunes: ["alignmentTuneTool"] },
        embed: { class: Embed, inlineToolbar: true, tunes: ["alignmentTuneTool"] },
        image: { class: SimpleImage, inlineToolbar: true, tunes: ["alignmentTuneTool"] },
        checklist: { class: Checklist, inlineToolbar: true },
        quote: Quote,
        warning: { class: Warning, inlineToolbar: true, tunes: ["alignmentTuneTool"] },
        code: { class: CodeTool, inlineToolbar: true },
        marker: { class: Marker },
        delimiter: Delimiter,
        inlineCode: InlineCode,
        linkTool: LinkTool,
        table: { class: Table, inlineToolbar: true, tunes: ["alignmentTuneTool"] },
        alert: { class: Alert, inlineToolbar: true, tunes: ["alignmentTuneTool"] },
        raw: Raw,
        underline: Underline,
        color: {
          class: ColorPlugin,
          config: { type: "text", colorCollections: colorsArray, defaultColor: "#000000" },
        },
        markerColor: {
          class: ColorPlugin,
          config: { type: "marker", colorCollections: colorsArray, defaultColor: "#FFEB3B" },
        },
        alignmentTuneTool: { class: AlignmentTuneTool },
        style: {
          class: EditorJSInlineStyle.StyleInlineTool,
          config: {
            sanitize: {
              span: { style: true, class: true, id: true },
              a: { href: true, style: true, class: true, id: true },
              b: { style: true, class: true },
              i: { style: true, class: true },
            },
          },
        },
      },
      onReady: () => {
        new Undo({ editor: editorRef.current, config: { shortcuts: { undo: "CMD+Z", redo: "CMD+SHIFT+Z" } } });
        new DragDrop(editorRef.current);
      },
      onChange: async () => {
        const savedData = await editorRef.current.save();
        console.log("Content changed:", savedData);
      },
      autofocus: true,
      logLevel: "error",
    });

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [loading]);

  if (loading) {
    return <div>Loading content...</div>;
  }

  return (
    <div className="editor-wrapper">
      <h2 className="editor-title">Test Editor Load</h2>
      <div id="editorjs" className="editor-area"></div>
    </div>
  );
}

export default TestEditorLoad;
