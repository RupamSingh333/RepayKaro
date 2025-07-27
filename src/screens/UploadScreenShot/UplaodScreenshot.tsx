import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
  Appearance,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import HeaderComponent from "../../components/HeaderComponent";
import { apiGet, apiPostMultipart, apiDelete } from '../../api/Api';

const { width } = Dimensions.get("window");

export default class UploadPaymentScreenshot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedImage: null,
      screenshots: [],
      loading: false,
      showDeleteModal: false,
      deleteId: null,
      client: null,
      fullScreenImage: null,
      theme: Appearance.getColorScheme(),
    };
    this.themeListener = null;
  }

  componentDidMount() {
    this.fetchClientData();
    this.fetchUploadedScreenshots();
    this.themeListener = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ theme: colorScheme });
    });
  }

  componentWillUnmount() {
    if (this.themeListener) this.themeListener.remove();
  }

  fetchClientData = async () => {
    try {
      const result = await apiGet('clients/get-client');
      if (result?.success && result?.client) {
        this.setState({ client: result.client });
      }
    } catch (error) {
      console.log("Error fetching client data:", error);
    }
  };

  pickImage = () => {
    const { client } = this.state;
    if (client?.isPaid) return;

    const options = { mediaType: "photo", quality: 0.8 };
    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorCode) return;
      const uri = response.assets?.[0]?.uri;
      if (uri) this.setState({ selectedImage: uri });
    });
  };

  uploadScreenshot = async () => {
    const { selectedImage, client } = this.state;

    if (client?.isPaid) return;
    if (!selectedImage) {
      this.props.toastRef.current?.show("Please select an image first.", 2500);
      return;
    }

    this.setState({ loading: true });

    const formData = new FormData();
    formData.append("screenshot", {
      uri: selectedImage,
      type: "image/jpeg",
      name: "screenshot.jpg",
    });

    try {
      const result = await apiPostMultipart('clients/upload-payment-screenshot', formData);
      if (result.success) {
        this.props.toastRef.current?.show("Uploaded successfully!", 2000);
        this.setState({ selectedImage: null });
        this.fetchUploadedScreenshots();
      } else {
        this.props.toastRef.current?.show("Upload failed. Try again.", 2500);
      }
    } catch (error) {
      console.log("Upload error:", error);
      this.props.toastRef.current?.show("Something went wrong!", 2500);
    } finally {
      this.setState({ loading: false });
    }
  };

  fetchUploadedScreenshots = async () => {
    try {
      const result = await apiGet('clients/get-screenshot');
      this.setState({ screenshots: result?.screen_shot || [] });
    } catch (error) {
      console.log("Fetch Screenshot Error:", error);
    }
  };

  openDeleteModal = (_id) => {
    if (this.state.client?.isPaid) return;
    this.setState({ showDeleteModal: true, deleteId: _id });
  };

  closeDeleteModal = () => this.setState({ showDeleteModal: false, deleteId: null });

  confirmDelete = async () => {
    const { deleteId } = this.state;
    if (!deleteId) return;

    this.setState({ showDeleteModal: false, loading: true });

    try {
      const result = await apiDelete(`clients/delete-screenshot/${deleteId}`);
      if (result.success) {
        this.props.toastRef.current?.show("Screenshot deleted", 2000);
        this.fetchUploadedScreenshots();
      }
    } catch (error) {
      console.log("Delete error:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  openFullScreenImage = (uri) => {
    this.setState({ fullScreenImage: uri });
  };

  closeFullScreenImage = () => {
    this.setState({ fullScreenImage: null });
  };

  render() {
    const { selectedImage, screenshots, loading, showDeleteModal, client, fullScreenImage, theme } = this.state;
    const isPaid = client?.isPaid;
    const isDark = theme === 'dark';

    // Define color variables based on the theme
    const textColor = isDark ? '#E5E7EB' : '#1d2939'; // For main text
    const subColor = isDark ? '#9CA3AF' : '#4B5563'; // For secondary text/info
    const bgColor = isDark ? '#1d2939' : '#F4F7FC'; // For screen background
    const cardBgColor = isDark ? '#2D3748' : '#FFFFFF'; // For main card/box backgrounds
    const borderColor = isDark ? '#4B5563' : '#C8C8C8'; // For borders
    const placeholderColor = isDark ? '#9CA3AF' : '#7B5CFA'; // For "Select or Upload" text
    const disabledBgColor = isDark ? '#4B5563' : '#E0E0E0'; // For disabled button backgrounds
    const disabledTextColor = isDark ? '#9CA3AF' : '#555'; // For disabled button text

    return (
      <View style={[styles.mainContainer, { backgroundColor: bgColor }]}>
        <HeaderComponent
          title="Upload Screenshot"
          showBack={true}
          onBackPress={() => this.props.navigation.goBack()}
          isDark={isDark} // Pass isDark to HeaderComponent
        />

        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.uploadContainer, { backgroundColor: cardBgColor, shadowColor: isDark ? '#000' : '#000' }]}>
            <TouchableOpacity
              style={[styles.dropBox, { borderColor: borderColor, backgroundColor: isDark ? '#374151' : '#FAFAFA' }]}
              onPress={this.pickImage}
              disabled={isPaid}
            >
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              ) : (
                <>
                  <Text style={[styles.selectText, { color: placeholderColor }, isPaid && { opacity: 0.4 }]}>📷 Select or Upload</Text>
                  <Text style={[styles.orText, { color: subColor }, isPaid && { opacity: 0.4 }]}>From Gallery</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: isPaid ? disabledBgColor : (isDark ? '#6B7280' : '#F0F0F0') }]}
                onPress={() => this.setState({ selectedImage: null })}
                disabled={isPaid}
              >
                <Text style={[styles.cancelText, { color: isPaid ? disabledTextColor : (isDark ? '#E5E7EB' : '#555') }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: isPaid ? disabledBgColor : '#7B5CFA' }]}
                onPress={this.uploadScreenshot}
                disabled={isPaid}
              >
                <Text style={[styles.uploadText, { color: isPaid ? disabledTextColor : '#fff' }]}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.uploadedContainer}>
            <Text style={[styles.uploadedTitle, { color: textColor }]}>Uploaded Screenshots</Text>
            {screenshots.length === 0 ? (
              <Text style={[styles.noScreenshots, { color: subColor }]}>No screenshots yet</Text>
            ) : (
              <View style={styles.gridContainer}>
                {screenshots.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => this.openFullScreenImage(item.screen_shot)}
                    style={styles.imageWrapper}
                    activeOpacity={0.8}
                  >
                    <Image source={{ uri: item.screen_shot }} style={styles.uploadedImage} />
                    {!isPaid && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => this.openDeleteModal(item._id)}
                      >
                        <Text style={styles.deleteX}>×</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fullscreen Image Modal */}
        <Modal visible={!!fullScreenImage} transparent animationType="fade">
          <View style={styles.fullscreenBackdrop}>
            <TouchableOpacity
              style={styles.fullscreenCloseIcon}
              onPress={this.closeFullScreenImage}
            >
              <Text style={styles.fullscreenCloseText}>×</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal transparent visible={showDeleteModal} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalBox, { backgroundColor: cardBgColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Delete Screenshot</Text>
              <Text style={[styles.modalMessage, { color: subColor }]}>Are you sure you want to delete this?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalCancel, { backgroundColor: isDark ? '#6B7280' : '#ccc' }]}
                  onPress={this.closeDeleteModal}
                >
                  <Text style={[styles.modalCancelText, { color: isDark ? '#E5E7EB' : '#333' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalDelete} onPress={this.confirmDelete}>
                  <Text style={styles.modalDeleteText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color={textColor} />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)", // Always dark for full screen image
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
  },
  fullscreenCloseIcon: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "#00000080",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenCloseText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    lineHeight: 30,
  },
  uploadContainer: {
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  dropBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 10,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  selectText: {
    fontSize: 16,
    fontWeight: "600",
  },
  orText: {
    fontSize: 13,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  cancelText: {
    fontWeight: "bold",
  },
  uploadButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadText: {
    color: "#fff",
    fontWeight: "bold",
  },
  uploadedContainer: {
    marginTop: 30,
  },
  uploadedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noScreenshots: {
    textAlign: "center",
    marginTop: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  imageWrapper: {
    margin: 6,
    position: "relative",
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  deleteButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF4D4D",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteX: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalMessage: {
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancel: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
  },
  modalDelete: {
    flex: 1,
    backgroundColor: "#FF4D4D",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  modalCancelText: {
    fontWeight: "bold",
  },
  modalDeleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
});