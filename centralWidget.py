# Jacob Wenger
# CSE 30332: Programming Paradigms
# Thursday, May 5, 2011

"""Main window for the GUI for the application which finds the shortest path (i.e. least number of links) between any two Wikipedia articles."""

from PyQt4.QtCore import *
from PyQt4.QtGui import *
import sqlite3
from breadthFirstSearch import breadthFirstSearch
from functools import partial

# Debugging imports
import sys
import logging
logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)


class ModifiedLineEdit(QLineEdit):
    """Modified QLineEdit class which changes the text color and updates it search suggestions."""

    def __init__(self, parent=None):
        """Initializes the modified QLineEdit."""
        super(ModifiedLineEdit, self).__init__(parent)

        # Store the QLineEdit's original text
        self.initial_text = self.text()

        # Set the height of the line edit, center the text, and set the font
        self.setFixedHeight(50)
        self.setAlignment(Qt.AlignCenter)
        self.setFont(QFont("", 18, True))
        
        # Set the text color to gray
        self.palette = QPalette();
        self.palette.setColor(QPalette.Text, Qt.gray)
        self.setPalette(self.palette)
        
        # Create a model to hold the list of search suggestions
        self.model = QStringListModel()
        
        # Create a QCompleter to display search suggestions depending on the current text in the QLineEdit
        self.completer = QCompleter()
        self.completer.setModel(self.model)
        self.completer.setMaxVisibleItems(15)
        
        # Connect the QCompleter to the current QLineEdit
        self.setCompleter(self.completer)


    def focusInEvent(self, event):
        """Clears the text and sets the text color to black when the focus is gained and the QLineEdit has its original text."""
        # Clear the default text and set the text color to black if the text is equal to the original text
        if (self.text() == self.initial_text):
            self.clear()
            self.palette.setColor(QPalette.Text, Qt.black)
            self.setPalette(self.palette)
        
        # Call QLineEdit's focusIn event
        QLineEdit.focusInEvent(self, event)


    def focusOutEvent(self, event):
        """Restores the initial text and set the text color to gray when focus is lost and the QLineEdit is empty."""
        # Restore the initial text and set the text color to gray if the QLineEdit is empty
        if (self.text() == ""):
            self.setText(self.initial_text)
            self.palette.setColor(QPalette.Text, Qt.gray)
            self.setPalette(self.palette)
       
        # Call QLineEdit's focusOut event
        QLineEdit.focusOutEvent(self, event)


class CentralWidget(QWidget):
    """Sets the layout for the central widget of the main window and allows the user to add, remove, save, and display trajectories."""

    def __init__(self, parent = None):
        """Sets the layout for the central widget of the main window."""
        super(CentralWidget, self).__init__(parent)

        # Create the modified line edits
        self.start_article = ModifiedLineEdit("Starting Article")
        self.end_article = ModifiedLineEdit("Ending Article")

        # Create the search log
        self.log = QTextBrowser()
        self.log.setFont(QFont("", 10, True))
        self.log.setMinimumSize(900, 450)

        # Create the search button
        find_links_button = QPushButton("Find Wikipedia Links!")
        find_links_button.setFixedHeight(50)
        find_links_button.setFont(QFont("", 18, True))
        
        # Set the focus to the central window
        self.setFocus()

        # Create the main window grid layout
        layout = QGridLayout()
        layout.addWidget(self.start_article, 0, 0)
        layout.addWidget(self.end_article, 0, 1)
        layout.addWidget(find_links_button, 1, 0, 1, 2)
        layout.addWidget(self.log, 2, 0, 1, 2)
        
        # Set the main window grid layout
        self.setLayout(layout)

        # Connect the serach button to the breadth first search function
        self.connect(find_links_button, SIGNAL("clicked()"), self.findWikipediaLinks)

        # Connect each article line edit to update its color and search suggestions every time a key is pressed
        self.connect(self.start_article, SIGNAL("textChanged(QString)"), partial(self.updateArticle, self.start_article))
        self.connect(self.end_article, SIGNAL("textChanged(QString)"), partial(self.updateArticle, self.end_article))

    
    def updateArticle(self, article_lineedit):
        """Updates the color of the article text and the search suggestions each time a key press occurs."""
        # Get the article names by replacing the spaces in the text of QLineEdit with underscores
        article = article_lineedit.text().replace(" ", "_")
        
        # If the QLineEdit is empty, set the text color to black
        if (article == ""):
            article_lineedit.palette.setColor(QPalette.Text, Qt.black)

        # Otherwise, determine if the text is a Wikipedia article
        else:
            # Create a connection to the pages database
            pages_backward_conn = sqlite3.connect("databaseFiles-20110405/pages.name.sqlite")
            cpb = pages_backward_conn.cursor()

            # Query the pages database to see if the article is a Wikipedia article
            cpb.execute("SELECT id FROM pages WHERE name = '%s'" % article)
            result = cpb.fetchone()

            # If the article is not a Wikipedia article, set the text color to red
            if (result == None):
                article_lineedit.palette.setColor(QPalette.Text, Qt.red)
            
            # Othwerise, determine if the text is a redirect
            else:
                # Get the id of the article from the database
                article_id = result[0]

                # Create a connection to the redirects database
                redirects_conn = sqlite3.connect("databaseFiles-20110405/redirects.from_id.sqlite")
                cr = redirects_conn.cursor()

                # Query the redirects database to see if the article is a Wikipedia redirect
                cr.execute("SELECT to_id FROM redirects WHERE from_id = %d" % article_id)
                result = cr.fetchone()
                
                # if the article is a redirect, set the text color to yellow
                if (result != None):
                    article_lineedit.palette.setColor(QPalette.Text, QColor(255, 190, 32))
                
                # Othwerise, the article is a Wikipedia article, so set the text color to dark green
                else:
                    article_lineedit.palette.setColor(QPalette.Text, Qt.darkGreen)
        
        # Set the text palette
        article_lineedit.setPalette(article_lineedit.palette)
        
        if (article != ""):
            # Create a connection to the pages database
            pages_forward_conn = sqlite3.connect("databaseFiles-20110405/pages.name.sqlite")
            cpf = pages_forward_conn.cursor()

            # Query the pages database to see if the article is a Wikipedia article
            end = article[:-1] + chr(ord(str(article[-1])) + 1)
            cpf.execute("SELECT name, id FROM pages WHERE name >= '%s' AND name < '%s' LIMIT 2000" % (article, end))
            
            # Create a connection to the pagecounts database
            pagecounts_conn = sqlite3.connect("databaseFiles-20110405/pagecounts.name.sqlite")
            pc = pagecounts_conn.cursor()
        
            if (len(article) == 1):
                min_count = 10
            elif (len(article) <= 4):
                min_count = 5
            else:
                min_count = 1

            suggestions = []
            for name, id in cpf:
                pc.execute("SELECT count FROM pagecounts WHERE name = '%s'" % name.replace("'", ""))
                count = pc.fetchone()
                if ((count != None) and (count[0] >= min_count)):
                    suggestions.append(name.replace("_", " ").replace("\\", ""))
                    if (len(suggestions) >= 20):
                        break

            # Update the search suggestions for the QCompleter and display the QCompleter
            article_lineedit.model.setStringList(suggestions)
            article_lineedit.completer.complete()


    def findWikipediaLinks(self):
        """Returns list of wikipedia links."""
        # Set the database names
        pages_forward_db = "databaseFiles-20110405/pages.id.sqlite"
        pages_backward_db = "databaseFiles-20110405/pages.name.sqlite"
        links_forward_db = "databaseFiles-20110405/links.from_id.sqlite"
        links_backward_db = "databaseFiles-20110405/links.to_id.sqlite"
        redirects_db = "databaseFiles-20110405/redirects.from_id.sqlite"

        # Get the start and end page names from the command line, replace all spaces with underscores
        start = self.start_article.text().replace(" ", "_")
        end = self.end_article.text().replace(" ", "_")

        # Simply return if either start or end are empty
        if (start == "Starting_Article"):
            self.log.append("No starting article specified.\n")
            return
        elif (end == "Ending_Article"):
            self.log.append("No ending article specified.\n")
            return

        # Create database connections to the pages database
        pages_forward_conn = sqlite3.connect(pages_forward_db)
        cpf = pages_forward_conn.cursor()
        pages_backward_conn = sqlite3.connect(pages_backward_db)
        cpb = pages_backward_conn.cursor()

        # Make sure starting article actually is a Wikipedia article
        cpb.execute("SELECT id FROM pages WHERE name = '%s'" % start)
        result = cpb.fetchone()
        if (result == None):
            self.log.append("The starting article '" + start.replace("_", " ") + "' is not a Wikipedia article.\n")
            return
        else:
            start_id = result[0]

        # Make sure ending article actually is a Wikipedia article
        cpb.execute("SELECT id FROM pages WHERE name = '%s'" % end)
        result = cpb.fetchone()
        if (result == None):
            self.log.append("The ending article '" + end.replace("_", " ") + "' is not a Wikipedia article.\n")
            return
        else:
            end_id = result[0]

        # Create a connection to the redirects database
        redirects_conn = sqlite3.connect(redirects_db)
        cr = redirects_conn.cursor()

        # If the starting article is a redirect, alert the user and provide them with the actual article to which it redirects and then quit
        cr.execute("SELECT to_id FROM redirects WHERE from_id = %d" % start_id)
        result = cr.fetchone()
        if (result != None):
            cpf.execute("SELECT name FROM pages WHERE id = %d" % result[0])
            result2 = cpf.fetchone()
            self.log.append("The starting article '" + start.replace("_", " ") + "' is a Wikipedia article redirect to '" + result2[0].replace("_", " ") + "'.\n")
            return

        # If the ending article is a redirect, alert the user and provide them with the actual article to which it redirects and then quit
        cr.execute("SELECT to_id FROM redirects WHERE from_id = %d" % end_id)
        result = cr.fetchone()
        if (result != None):
            cpf.execute("SELECT name FROM pages WHERE id = %d" % result[0])
            result2 = cpf.fetchone()
            self.log.append("The ending article '" + end.replace("_", " ") + "' is a Wikipedia article redirect to '" + result2[0].replace("_", " ") + "'.\n")
            return

        # Run a bi-directional breadth first search from start to end and get a list of the shortest paths between them
        paths = breadthFirstSearch(start_id, end_id, links_forward_db, links_backward_db, False)

        # If no paths from start to end were found, print that out
        if (len(paths) == 0):
            self.log.append("No paths found from '" + start.replace("_", " ") + "' to '" + end.replace("_", " ") + "'.")
        
        # Otherwise, at least one path from start to end was found so print out every path
        else:
            # Print different messages depending on how many paths were found and how long the paths are
            if (len(paths) == 1):
                if (len(paths[0]) == 1):
                    self.log.append("1 path of 1 degree found:")
                else:
                    self.log.append("1 path of " + str(len(paths[0])) + " degrees found:")
            else:
                if (len(paths[0]) == 1):
                    self.log.append(str(len(paths)) + " paths of 1 degree found:")
                else:
                    self.log.append(str(len(paths)) + " paths of " + str(len(paths[0])) + " degrees found:")
        
            # Print out the ids in each path
            paths_names = [] #
            for path in paths:
                current_path_names = [] #
                current_path = ""
                first = True
                for id in path:
                    cpf.execute("SELECT name FROM pages WHERE id = %d" % id)
                    result = cpf.fetchone()
                    current_path_names.append(result[0].replace("_", " ").encode('utf-8')) #
                    if (id == path[0]):
                        current_path += "   " + str(result[0].replace("_", " ").replace("\\", "").encode('utf-8'))
                    else:
                        current_path += " | " + str(result[0].replace("_"," ").replace("\\", "").encode('utf-8'))
                self.log.append(current_path)
                paths_names.append(current_path_names) #

        # Print an empty line
        self.log.append("")

        # Close the database connections
        cpf.close()
        cpb.close()
        cr.close()
