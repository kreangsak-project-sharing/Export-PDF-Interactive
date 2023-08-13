(function () {
  var title = "Export PDF in Interactive";

  // Script variables
  var doneMessage;
  var pdfPreset;
  var pdfPresetNames;
  var progress;

  // Reusable UI variables
  var g; // group
  var p; // panel
  var w; // window

  // Permanent UI variables
  var btnCancel;
  var btnFolderInput;
  var btnFolderOutput;
  var btnOk;
  var grpPreset;
  var listPdfPresets;
  var rbPdfInteractive;
  var rbPdfPrint;
  var txtFolderInput;
  var txtFolderOutput;

  var rbSameLocation;
  var rbSelectFolder;
  var outputPath;

  var rbOptionReaderSpreads;
  var rbOptionReaderPages;

  // SETUP

  // Load application PDF presets.
  pdfPresetNames = app.pdfExportPresets.everyItem().name;
  pdfPresetNames.sort();

  // CREATE PROGRESS WINDOW

  progress = new Window("palette", "Progress", undefined, {
    closeButton: false,
  });
  progress.t = progress.add("statictext");
  progress.t.preferredSize = [450, -1];
  progress.b = progress.add("progressbar");
  progress.b.preferredSize = [450, -1];
  progress.display = function (message) {
    message && (this.t.text = message);
    this.show();
    this.update();
  };
  progress.increment = function () {
    this.b.value++;
  };
  progress.set = function (steps) {
    this.b.value = 0;
    this.b.minvalue = 0;
    this.b.maxvalue = steps;
  };

  // CREATE USER INTERFACE

  w = new Window("dialog", title);
  w.alignChildren = "fill";

  p = w.add("panel", undefined, "Input");
  p.margins = [18, 18, 18, 18];
  g = p.add("group");
  g.alignment = "left";
  btnFolderInput = g.add("button", undefined, "Folder...");
  txtFolderInput = g.add("statictext", undefined, "", {
    truncate: "middle",
  });
  txtFolderInput.preferredSize = [300, -1];

  p = w.add("panel", undefined, "Export as");
  p.margins = [18, 18, 18, 18];
  g = p.add("group");
  g.alignment = "left";

  rbOptionReaderSpreads = g.add("radiobutton", undefined, "Spreads");
  rbOptionReaderPages = g.add("radiobutton", undefined, "Pages");

  p = w.add("panel", undefined, "Output");
  p.margins = [18, 18, 18, 18];
  g = p.add("group");
  g.alignment = "left";

  rbSameLocation = g.add("radiobutton", undefined, "Same .innd file location");
  rbSelectFolder = g.add("radiobutton", undefined, "Select folder");

  btnFolderOutput = g.add("button", undefined, "Folder...");
  txtFolderOutput = g.add("statictext", undefined, "", {
    truncate: "middle",
  });
  txtFolderOutput.preferredSize = [300, -1];
  g = p.add("group");
  g.alignment = "left";
  rbPdfInteractive = g.add("radiobutton", undefined, "PDF Interactive");
  rbPdfPrint = g.add("radiobutton", undefined, "PDF Print");
  grpPreset = p.add("group");
  grpPreset.alignment = "left";
  grpPreset.add("statictext", undefined, "PDF preset:");
  listPdfPresets = grpPreset.add("dropdownlist", undefined, pdfPresetNames);

  rbOptionReaderSpreads.value = true;
  rbSameLocation.value = true;
  rbPdfInteractive.value = true;
  btnFolderOutput.enabled = false;
  // rbPdfPrint.value = true;
  grpPreset.enabled = false;

  g = w.add("group");
  g.alignment = "center";
  btnOk = g.add("button", undefined, "OK");
  btnCancel = g.add("button", undefined, "Cancel");

  // UI EVENT HANDLERS

  btnFolderInput.onClick = function () {
    var f = Folder.selectDialog();
    if (f) {
      txtFolderInput.text = f.fullName;
    }
  };

  btnFolderOutput.onClick = function () {
    var f = Folder.selectDialog();
    if (f) {
      txtFolderOutput.text = f.fullName;
    }
  };

  rbPdfInteractive.onClick = function () {
    if (this.value) {
      grpPreset.enabled = false;
    }
  };

  rbPdfPrint.onClick = function () {
    if (this.value) {
      grpPreset.enabled = true;
    }
  };

  // Custom
  rbSameLocation.onClick = function () {
    if (this.value) {
      btnFolderOutput.enabled = false;
    }
  };

  rbSelectFolder.onClick = function () {
    if (this.value) {
      btnFolderOutput.enabled = true;
    }
  };

  btnOk.onClick = function () {
    if (!txtFolderInput.text) {
      alert("Select input folder", " ", false);
      return;
    }
    if (!txtFolderOutput.text && !rbSameLocation.value) {
      alert("Select output folder", " ", false);
      return;
    }
    if (grpPreset.enabled && !listPdfPresets.selection) {
      alert("Select a PDF preset", " ", false);
      return;
    }
    w.close(1);
  };

  btnCancel.onClick = function () {
    w.close(0);
  };

  // SHOW THE WINDOW

  if (w.show() == 1) {
    try {
      process();
      alert(doneMessage || "Successful", title, false);
    } catch (e) {
      alert(
        "An error has occurred.\nLine " + e.line + ": " + e.message,
        title,
        true
      );
    }
  }

  // function process() {
  //   var files;
  //   var i;
  //   // Ignore messages when opening documents.
  //   app.scriptPreferences.userInteractionLevel =
  //     UserInteractionLevels.NEVER_INTERACT;
  //   progress.display("Reading folder...");
  //   // Get InDesign files in folder.
  //   files = new Folder(txtFolderInput.text).getFiles("*.indd");
  //   if (!files.length) {
  //     doneMessage = "No files found in selected folder";
  //     return;
  //   }
  //   progress.set(files.length);
  //   try {
  //     // Loop through files array.
  //     for (i = 0; i < files.length; i++) {
  //       progress.display(File.decode(files[i].name));
  //       processFile(files[i]);
  //     }
  //   } finally {
  //     progress.close();
  //   }
  // }

  function process() {
    var inputFolder = new Folder(txtFolderInput.text);
    var files = getAllInDesignFiles(inputFolder);
    var i;

    app.scriptPreferences.userInteractionLevel =
      UserInteractionLevels.NEVER_INTERACT;
    progress.display("Processing files...");

    progress.set(files.length);

    try {
      for (i = 0; i < files.length; i++) {
        progress.display(File.decode(files[i].name));
        processFile(files[i]);
      }
    } finally {
      progress.close();
    }
  }

  function getAllInDesignFiles(folder) {
    var files = [];
    var subFolders = folder.getFiles(function (file) {
      return file instanceof Folder;
    });

    for (var i = 0; i < subFolders.length; i++) {
      files = files.concat(getAllInDesignFiles(subFolders[i]));
    }

    var inddFiles = folder.getFiles("*.indd");

    // inddFiles = inddFiles.filter(function (file) {
    //     return file.name !== "._"; // Exclude files named exactly "._"
    // });

    files = files.concat(inddFiles);

    return files;
  }

  function processFile(file) {
    var doc;
    var filePdf;
    doc = app.open(file);
    try {
      if (rbSameLocation.value) {
        // Generate the output PDF file path in the same location as the InDesign file
        outputPath =
          file.parent.fsName + "/" + file.name.replace(/\.indd$/i, "") + ".pdf";
      } else {
        // Generate the output PDF file path in Select
        outputPath =
          txtFolderOutput.text +
          "/" +
          file.name.replace(/\.indd$/i, "") +
          ".pdf";
      }

      filePdf = new File(outputPath);

      if (rbPdfInteractive.value) {
        app.interactivePDFExportPreferences.properties = {
          exportAsSinglePages: false,
          exportLayers: true,
          // exportReaderSpreads: true, // Set this to true to export as spreads
          exportReaderSpreads: rbOptionReaderSpreads.value ? true : false, // Set this to true to export as spreads
          flipPages: false,
          flipPages: false,
          flipPagesSpeed: 5,
          generateThumbnails: true,
          includeStructure: false,
          interactivePDFInteractiveElementsOption:
            InteractivePDFInteractiveElementsOptions.INCLUDE_ALL_MEDIA,
          openInFullScreen: false,
          pageRange: PageRange.ALL_PAGES,
          pageTransitionOverride: PageTransitionOverrideOptions.FROM_DOCUMENT,
          pdfDisplayTitle: PdfDisplayTitleOptions.DISPLAY_FILE_NAME,
          pdfJPEGQuality: PDFJPEGQualityOptions.HIGH,
          pdfMagnification: PdfMagnificationOptions.DEFAULT_VALUE,
          pdfPageLayout: PageLayoutOptions.DEFAULT_VALUE,
          pdfRasterCompression: PDFRasterCompressionOptions.JPEG_COMPRESSION,
          rasterResolution: 300,
          usePDFStructureForTabOrder: false,
          viewPDF: false,
        };
        doc.exportFile(ExportFormat.INTERACTIVE_PDF, filePdf, false);
      } else if (rbPdfPrint.value) {
        // Get PDF preset to use.
        pdfPreset = app.pdfExportPresets.item(listPdfPresets.selection.text);
        // Set export preferences to all pages.
        app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;
        doc.exportFile(ExportFormat.PDF_TYPE, filePdf, false, pdfPreset);
      }
      progress.increment();
    } finally {
      doc.close(SaveOptions.NO);
    }
  }
})();
