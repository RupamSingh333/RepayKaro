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
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import HeaderComponent from "../../components/HeaderComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      fullScreenImage: null, // for full screen image preview
    };
  }

  componentDidMount() {
    this.fetchClientData();
    this.fetchUploadedScreenshots();
  }

  fetchClientData = async () => {
    const token = await AsyncStorage.getItem("liveCustomerToken");
    if (!token) return;

    try {
      const res = await fetch("https://api.repaykaro.com/api/v1/clients/get-client", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
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

    const token = await AsyncStorage.getItem("liveCustomerToken");
    if (!token) {
      this.props.toastRef.current?.show("Auth token not found", 2500);
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
      const res = await fetch("https://api.repaykaro.com/api/v1/clients/upload-payment-screenshot", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
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
    const token = await AsyncStorage.getItem("liveCustomerToken");
    if (!token) return;

    try {
      const res = await fetch("https://api.repaykaro.com/api/v1/clients/get-screenshot", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
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
    const token = await AsyncStorage.getItem("liveCustomerToken");
    if (!token || !deleteId) return;

    this.setState({ showDeleteModal: false, loading: true });

    try {
      const res = await fetch(
        `https://api.repaykaro.com/api/v1/clients/delete-screenshot/${deleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await res.json();
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
    const { selectedImage, screenshots, loading, showDeleteModal, client, fullScreenImage } = this.state;

    const isPaid = client?.isPaid;

    return (
      <View style={{ flex: 1, backgroundColor: "#F9F9F9" }}>
        <HeaderComponent
          title="Upload Screenshot"
          showBack={true}
          onBackPress={() => this.props.navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.uploadContainer}>
            <TouchableOpacity
              style={styles.dropBox}
              onPress={this.pickImage}
              disabled={isPaid}
            >
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              ) : (
                <>
                  <Text style={[styles.selectText, isPaid && { opacity: 0.4 }]}>📷 Select or Upload</Text>
                  <Text style={[styles.orText, isPaid && { opacity: 0.4 }]}>From Gallery</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, isPaid && { backgroundColor: "#E0E0E0" }]}
                onPress={() => this.setState({ selectedImage: null })}
                disabled={isPaid}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadButton, isPaid && { backgroundColor: "#C0C0C0" }]}
                onPress={this.uploadScreenshot}
                disabled={isPaid}
              >
                <Text style={styles.uploadText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.uploadedContainer}>
            <Text style={styles.uploadedTitle}>Uploaded Screenshots</Text>
            {screenshots.length === 0 ? (
              <Text style={styles.noScreenshots}>No screenshots yet</Text>
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
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Delete Screenshot</Text>
              <Text style={styles.modalMessage}>Are you sure you want to delete this?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalCancel} onPress={this.closeDeleteModal}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
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
            <ActivityIndicator size="large" color="#7B5CFA" />
          </View>
        )}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  fullscreenBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  dropBox: {
    borderWidth: 2,
    borderColor: "#C8C8C8",
    borderStyle: "dashed",
    borderRadius: 10,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#FAFAFA",
  },
  selectText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7B5CFA",
  },
  orText: {
    fontSize: 13,
    color: "#888",
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
    backgroundColor: "#F0F0F0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  cancelText: {
    color: "#555",
    fontWeight: "bold",
  },
  uploadButton: {
    flex: 1,
    backgroundColor: "#7B5CFA",
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
    color: "#333",
  },
  noScreenshots: {
    color: "#888",
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
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalMessage: {
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancel: {
    flex: 1,
    backgroundColor: "#ccc",
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
    color: "#333",
    fontWeight: "bold",
  },
  modalDeleteText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

