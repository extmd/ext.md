//
//  ShareViewController.swift
//  extmd-share
//
//  Created by Timo Tiuraniemi on 07/10/15.
//
//

import UIKit
import Social
import MobileCoreServices

class ShareViewController: SLComposeServiceViewController {

    var linkUrl: String?
    var linkTitle: String?
    var inboxId: String?
    var processingData: Bool = false

    override func isContentValid() -> Bool {
        saveInboxIdLinkUrlAndTitle();
        if let inbox = self.inboxId, let url = self.linkUrl, let title = self.linkTitle, !inbox.isEmpty && !url.isEmpty && !title.isEmpty{
            return true
        }
        return false
    }

    override func didSelectPost() {
        if let inboxId = self.inboxId, let linkUrl = self.linkUrl, let linkTitle = self.linkTitle{
            let url = "https://ext.md/api/v2/inbox/" + inboxId
            let escLinkUrl = self.encodeStringForHttpRequest(string: linkUrl)
            let escLinkTitle = self.encodeStringForHttpRequest(string: linkTitle)
            let postData = ("Subject=" + escLinkTitle + "&stripped-text=" + escLinkUrl).data(using: String.Encoding.utf8)
            let request = NSMutableURLRequest(url: NSURL(string: url)! as URL)
            request.httpMethod = "POST"
            request.httpBody = postData
            request.setValue(String(postData!.count), forHTTPHeaderField: "Content-Length")
            request.setValue("application/x-www-form-urlencoded;charset=utf-8", forHTTPHeaderField: "Content-Type")
            let task = URLSession.shared.dataTask(with: request as URLRequest) {
                data, response, error in
                if (error != nil || (response! as! HTTPURLResponse).statusCode != 200) {
                    self.alertError(errorText: "Could not save link, are you online?", onOKPressed: self.closeExtension)
                }else{
                    // print(NSString(data: data!, encoding: NSUTF8StringEncoding))
                    // Inform the host that we're done, so it un-blocks its UI. Note: Alternatively you could call super's -didSelectPost, which will similarly complete the extension context.
                    self.extensionContext!.completeRequest(returningItems: [], completionHandler: nil)
                }
            }
            task.resume()
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
    }

    override func presentationAnimationDidFinish(){
        if (self.inboxId == nil){
            self.alertError(errorText: "Account not created or connected. Sign up or log in to your extended mind account and retry.", onOKPressed: self.closeExtension)
            self.textView.resignFirstResponder()
        }else if (self.linkTitle == nil || self.linkUrl == nil){
            self.alertError(errorText: "Could not find information from shared link", onOKPressed: self.closeExtension)
            self.textView.resignFirstResponder()
        }
    }

    private func saveInboxIdLinkUrlAndTitle(){
        if (!self.processingData){
            self.processingData = true

            let defaults = UserDefaults.init(suiteName: "group.org.extendedmind")
            if let emDefaults = defaults{
                if let inbox = emDefaults.string(forKey: "inboxId"), !inbox.isEmpty{
                    self.inboxId = inbox
                }
            }

            let content = extensionContext!.inputItems[0] as! NSExtensionItem
            let contentType = kUTTypePropertyList as String

            for attachment in content.attachments as! [NSItemProvider] {
                if attachment.hasItemConformingToTypeIdentifier(contentType) {
                    attachment.loadItem(forTypeIdentifier: contentType, options: nil) { data, error in
                        if error == nil {
                            let jsDict = data as! NSDictionary
                            if let jsPreprocessingResults = jsDict[NSExtensionJavaScriptPreprocessingResultsKey] {
                                self.linkUrl = (jsPreprocessingResults as? [String : String])?["url"]
                                self.linkTitle = (jsPreprocessingResults as? [String : String])?["title"]
                                super.validateContent()
                            }
                        }
                    }
                }
            }
        }
    }

    private func alertError(errorText: String, onOKPressed: @escaping () -> Void){
        let alert = UIAlertController(title: "Error", message: errorText, preferredStyle: .alert)
        let action = UIAlertAction(title: "OK", style: .cancel) { _ in
            self.dismiss(animated: true, completion: nil)
            onOKPressed()
        }

        alert.addAction(action)
        self.present(alert, animated: true, completion: nil)
    }

    private func closeExtension() -> Void {
        super.cancel()
    }

    // From http://stackoverflow.com/a/19263420/2659424
    private func encodeStringForHttpRequest(string: String) -> String{
        let result = CFURLCreateStringByAddingPercentEscapes(kCFAllocatorDefault,
                                                             string as CFString,
                                                             " " as CFString,
                                                             ":/?@!$&'()*+,;=" as CFString,
                                                             CFStringBuiltInEncodings.UTF8.rawValue) as String
        return result.replacingOccurrences(of: " ", with: "+")
    }

}
