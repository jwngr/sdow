# Jacob Wenger
# CSE 30332: Programming Paradigms
# Thursday, May 5, 2011

"""Application which finds the shortest path (i.e. least number of links) between any two Wikipedia articles."""

import sys
from PyQt4.QtCore import *
from PyQt4.QtGui import *
from centralWidget import *

class MainWindow(QMainWindow):
    """Main window for Six Degrees of Wikipedia."""
    def __init__(self, parent = None):
        super(MainWindow, self).__init__(parent)
        
        # Set the window title
        self.setWindowTitle("Six Degrees of Wikipedia")

        # Set the central widget to an instance of CentralWidget
        self.central = CentralWidget(parent = self)
        self.setCentralWidget(self.central)

# Create an application and show the main window
app = QApplication(sys.argv)
mainwindow = MainWindow()
mainwindow.show()
app.exec_()
