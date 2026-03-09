class PDFConversionDefaultOptions:
    """Default options for converting PDFs to images"""

    DPI = 500
    FORMAT = "png"
    SIZE = (None, 1056)
    THREAD_COUNT = 4
    USE_PDFTOCAIRO = True
